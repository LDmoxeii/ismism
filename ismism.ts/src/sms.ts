import { to_hex } from "./ontic/base.ts"
import { digest, key, sign } from "./ontic/crypt.ts"
import { utc_date } from "./ontic/utc.ts"

const tc: {
	id: string,
	key: string,
	service: string,
	endpoint: string,
	region: string,
	ver: string,
	appid: string,
	sign: string,
	template: string,
} = JSON.parse(await Deno.readTextFile("./tc.json"))

type SendResponse = {
	Response: { SendStatusSet: { Code: string }[] }
}

export async function smssend(
	nbr: string,
	code: number,
	hr: number
) {
	const body = JSON.stringify({
		PhoneNumberSet: [nbr],
		SmsSdkAppId: tc.appid,
		SignName: tc.sign,
		TemplateId: tc.template,
		TemplateParamSet: [`${code}`, `${hr}`],
	})
	const alg = "TC3-HMAC-SHA256"
	const t = Math.round(Date.now() / 1000)
	const d = utc_date(t * 1000)
	const scope = `${d}/${tc.service}/tc3_request`
	const sigheader = "content-type;host"
	const content_type = "application/json; charset=utf-8"
	const req = `POST
/

content-type:${content_type}
host:${tc.endpoint}

${sigheader}
${to_hex(await digest(body))}`

	const str = `${alg}
${t}
${scope}
${to_hex(await digest(req))}`
	const kdate = await sign(await key(`TC3${tc.key}`), d)
	const kservice = await sign(await key(kdate), tc.service)
	const ksign = await sign(await key(kservice), "tc3_request")
	const signature = to_hex(await sign(await key(ksign), str))
	const authorization = `${alg} Credential=${tc.id}/${scope}, SignedHeaders=${sigheader}, Signature=${signature}`

	const res = await fetch(`https://${tc.endpoint}`, {
		method: "POST",
		headers: {
			"Authorization": authorization,
			"Content-Type": content_type,
			"Host": tc.endpoint,
			"X-TC-Action": "SendSms",
			"X-TC-Timestamp": `${t}`,
			"X-TC-Version": tc.ver,
			"X-TC-Region": tc.region,
		},
		body,
	})
	const json = await res.json() as SendResponse
	return {
		json, sent: json.Response.SendStatusSet[0]?.Code === "Ok"
	}
}
