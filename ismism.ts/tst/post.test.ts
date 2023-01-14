import { assert } from "https://deno.land/std@0.163.0/testing/asserts.ts"
import { jwk_set } from "../src/aut.ts"
import type { Act } from "../src/dbtyp.ts"
import { post, PostPass, UserPassCode, UserPassClear } from "../src/query.ts"
import { act_del, act_new } from "../src/query/act.ts"
import { uid_tst, UserPass, user_del, user_new, user_set } from "../src/query/user.ts"

function b(json: {
	act?: string,
	nbr?: string,
	code?: number,
	sms?: boolean,
	renew?: boolean,
}): string {
	return JSON.stringify(json)
}

Deno.test("usernew", async () => {
	const nbr = "11111111112"
	const a_new: Act = {
		_id: "tstusernew",
		exp: 0,
		act: "usernew",
		referer: [728],
	}
	await act_del(a_new._id)
	const actid_new = await act_new(a_new)
	assert(actid_new && actid_new.length > 0)
	const p: PostPass = {}
	const uid = await post("usernew", p, b({ nbr, act: a_new._id })) as number
	assert(uid > 0)
	const a_nbr: Act = {
		_id: "tstusernbr",
		exp: 0,
		act: "usernbr",
		uid
	}
	await act_del(a_nbr._id)
	const actid_nbr = await act_new(a_nbr)
	assert(actid_nbr && actid_nbr.length > 0)
	const r = await post("usernew", p, b({ nbr: "11111111113", act: a_nbr._id })) as number
	assert(r === uid)
	assert(await user_del(uid))
})

Deno.test("userpass", async () => {
	const nbr = "11111111111"
	const code = 111111
	const utst = {
		name: "测试",
		utc: Date.now(),
		referer: [728],
		intro: "this is a test",
		nbr,
	}
	const rz = await user_set(uid_tst, utst)
	assert(rz === 0)
	const a_new: Act = {
		_id: "tstusernew",
		exp: 0,
		act: "usernew",
		referer: [728],
	}
	await act_del(a_new._id)
	await act_new(a_new)
	const uid = await user_new(a_new._id, nbr)
	assert(uid && uid > 0)
	const rt = await user_set(uid, utst)
	assert(rt === 1)

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
