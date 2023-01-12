import { assert } from "https://deno.land/std@0.163.0/testing/asserts.ts"
import { jwk_set } from "../src/aut.ts";
import { post, PostPass, UserPassCode, UserPassClear } from "../src/query.ts"
import { uid_tst, UserPass, user_set } from "../src/query/user.ts"

function b(json: {
	nbr?: string,
	code?: number,
	sms?: boolean,
	renew?: boolean,
}): string {
	return JSON.stringify(json)
}

Deno.test("userpass", async () => {
	const nbr = "11111111111"
	const code = 111111
	const rset = await user_set(uid_tst, {
		name: "测试",
		utc: Date.now(),
		referer: [728],
		intro: "this is a test",
		nbr,
	})
	assert(rset.matchedCount === 1)

	await jwk_set("anotherkey")

	const p = {} as PostPass
	const rc = (await post("userpass_code", p, b({ nbr, sms: false }))) as UserPassCode
	assert(rc && rc.sent === false && p.jwt === undefined && p.u === undefined)
	const rw = (await post("userpass_code", p, b({ nbr, sms: true }))) as UserPassCode
	assert(rw && rw.sent === false && rw.utc && p.jwt === undefined && p.u === undefined)
	const ri = (await post("userpass_issue", p, b({ nbr, code, renew: false }))) as UserPass
	assert(ri.uid == 100 && p.u!.uid == 100 && ri.utc == p.u!.utc && Date.now() - ri.utc < 100 && p.jwt)

	const p2 = {} as PostPass
	await post("userpass_issue", p2, b({ nbr, code, renew: true }))
	assert(p.jwt == p2.jwt && p2.u!.uid == 100)
	await post("userpass_issue", p2, b({ nbr, code, renew: false }))
	assert(p.jwt != p2.jwt && p2.u!.uid == 100)

	const p3 = { jwt: p2.jwt } as PostPass
	const r = await post("", p3, "")
	assert(r === null && p3.jwt === undefined && p3.u!.uid === 100)
	const u = (await post("userpass", { jwt: p2.jwt }, "")) as UserPass
	assert(u && u.uid == 100 && p2.jwt && p2.u)

	const uc = await post("userpass_clear", p2, "") as UserPassClear
	assert(uc!.cleared && !p2.jwt && !p2.u)
})
