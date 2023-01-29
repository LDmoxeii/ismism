import { assert, assertEquals } from "https://deno.land/std@0.173.0/testing/asserts.ts"
import { db } from "../src/db.ts"
import { user_c, user_d, user_r } from "../src/eidetic/user.ts"
import { jwk_set } from "../src/ontic/jwt.ts"
import { Pass } from "../src/praxic/pass.ts"
import { PassCode, post } from "../src/praxic/post.ts"
import { PassPost } from "../src/praxic/post.ts"

await db("tst", true)
await jwk_set("testkey")

const json = JSON.stringify

Deno.test("pass", async () => {
	const nbr = "11111111111"
	const uid = await user_c(nbr, [1, 2], "四川", "成都")
	assert(uid === 1)
	const p: PassPost = {}
	assert(null === await post(p, "pass", ""))
	assertEquals(p, { pass: null })
	assertEquals(await post(p, "pass_code", json({ nbr, sms: false })), { sms: false })
	const passcode = await post(p, "pass_code", json({ nbr, sms: true })) as PassCode
	assert(passcode && passcode.sms === false && passcode.utc && passcode.utc > 0)
	const pcode = await user_r({ _id: uid }, { pcode: 1 })
	assert(pcode && pcode.pcode && pcode.pcode.code > 0)
	const code = pcode.pcode.code
	assert(null === await post(p, "pass_issue", json({ nbr, code: code + 1 })))
	assertEquals(p, { pass: null })
	const pass = await post(p, "pass_issue", json({ nbr, code: code })) as Pass
	assert(p.jwt && p.jwt.length > 0 && p.pass && p.pass.id.uid === uid)
	const jwt = p.jwt
	assertEquals(p.pass, pass)
	assertEquals(await post(p, "pass", ""), pass)
	assertEquals(p, { pass, jwt: null })
	assertEquals(await post(p, "pass", ""), null)
	await post(p, "pass_issue", json({ nbr, code: code }))
	assertEquals(p.jwt, jwt)
	assertEquals(await post(p, "pass_clear", ""), 1)
	assertEquals(p, { pass: null, jwt: null })
	assertEquals(await user_r({ _id: uid }, { ptoken: 1 }), { _id: uid })
	await user_d(uid)
})
