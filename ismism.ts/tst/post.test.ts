import { assert } from "https://deno.land/std@0.163.0/testing/asserts.ts"
import { jwk_set } from "../src/aut.ts";
import { post, PostPass, SmsCode } from "../src/query.ts"
import { UserPass } from "../src/query/user.ts"

function b(json: {
	nbr?: string,
	code?: number,
	sms?: boolean,
	renew?: boolean,
}): string {
	return JSON.stringify(json)
}

Deno.test("userpass", async () => {
	{
		const p: PostPass = {}
		const r = await post("", p, "")
		assert(r === null && p.jwt === undefined && p.u === undefined)
	} {
		await jwk_set("anotherkey")
		const p: PostPass = {}
		const r1 = (await post("userpass_code", p, b({ nbr: "11111111111", code: 111111, sms: false }))) as SmsCode
		assert(r1 && r1.sent === false && p.jwt === undefined && p.u === undefined)
		const r2 = (await post("userpass_code", p, b({ nbr: "11111111111", code: 111112, sms: true }))) as SmsCode
		assert(r2 === null && p.jwt === undefined && p.u === undefined)
		const r3 = (await post("userpass_issue", p, b({ nbr: "11111111111", code: 111111, renew: false }))) as UserPass
		const jwt = p.jwt!
		const utc = p.u!.utc
		assert(r3.uid === 100 && Date.now() - r3.utc < 10000 && jwt && p.u!.uid == 100 && r3.utc == utc)
		const p2: PostPass = {}
		await post("userpass_issue", p2, b({ nbr: "11111111111", code: 111111, renew: true }))
		assert(jwt == p2.jwt!)
		await post("userpass_issue", p2, b({ nbr: "11111111111", code: 111111, renew: false }))
		assert(jwt != p2.jwt! && p2.u?.uid == 100)
	}
})
