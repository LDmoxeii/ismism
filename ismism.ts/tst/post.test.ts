import { assert, assertEquals } from "https://deno.land/std@0.173.0/testing/asserts.ts"
import { coll, db } from "../src/db.ts"
import { agenda_c, agenda_d } from "../src/eidetic/agenda.ts"
import { aut_c, aut_d } from "../src/eidetic/aut.ts"
import { rec_c, rec_d } from "../src/eidetic/rec.ts"
import { soc_c, soc_d } from "../src/eidetic/soc.ts"
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
	assertEquals(await post(p, "pass", json({ nbr, sms: false })), { sms: false })
	const passcode = await post(p, "pass", json({ nbr, sms: true })) as PassCode
	assert(passcode && passcode.sms === false && passcode.utc && passcode.utc > 0)
	const pcode = await user_r({ _id: uid }, { pcode: 1 })
	assert(pcode && pcode.pcode && pcode.pcode.code > 0)
	const code = pcode.pcode.code
	assert(null === await post(p, "pass", json({ nbr, code: code + 1 })))
	assertEquals(p, { pass: null })
	const pass = await post(p, "pass", json({ nbr, code: code })) as Pass
	assert(p.jwt && p.jwt.length > 0 && p.pass && p.pass.id.uid === uid)
	const jwt = p.jwt
	assertEquals(p.pass, pass)
	assertEquals(await post(p, "pass", ""), pass)
	assertEquals(p, { pass, jwt: null })
	assertEquals(await post(p, "pass", ""), null)
	await post(p, "pass", json({ nbr, code: code }))
	assertEquals(p.jwt, jwt)
	assertEquals(await post(p, "pass", json({ uid: p.pass.id.uid })), 1)
	assertEquals(p, { pass: null, jwt: null })
	assertEquals(await user_r({ _id: uid }, { ptoken: 1 }), { _id: uid })
	await user_d(uid)
})

Deno.test("pro", async () => {
	const p: PassPost = {}
	const nbr = ["11111111111", "11111111112", "11111111113"]
	const utc = Date.now()
	const recid = { uid: 3, aid: 1, utc }
	assertEquals([
		await user_c(nbr[0], [1, 2], "四川", "成都"),
		await user_c(nbr[1], [1, 2], "广东", "汕头"),
		await user_c(nbr[2], [2], "广东", "汕头"),
		{ sms: false }, { sms: false }, 1, 1,
		recid,
	], await Promise.all([
		aut_c({ _id: 1, p: ["pro_user", "pro_soc", "pro_agenda"] }),
		aut_c({ _id: 2, p: ["pro_user", "pro_soc", "pro_agenda"] }),
		aut_c({ _id: 3, p: ["pro_user"] }),
		...[0, 2].map(n => post(p, "pass", json({ nbr: nbr[n], sms: false }))),
		soc_c("团体", [1, 2], "四川", "成都", ""),
		agenda_c("活动", [1, 2], "四川", "成都", ""),
		rec_c(coll.worker, { _id: recid, rej: [], ref: [1, 2], exp: utc + 10000, role: "worker" })
	]))
	const code = await Promise.all([1, 3].map(_id => user_r({ _id }, { pcode: 1 })))
	await post(p, "pass", json({ nbr: nbr[0], code: code[0]?.pcode?.code }))
	assertEquals([null, 1, 0, 1, 1, 1, null, null], await Promise.all([
		post(p, "pro", json({ re: "rej", uid: 2, pro: true })),
		post(p, "pro", json({ re: "ref", uid: 3, pro: true })),
		post(p, "pro", json({ re: "ref", sid: 1, pro: true })),
		post(p, "pro", json({ re: "rej", sid: 1, pro: true })),
		post(p, "pro", json({ re: "ref", aid: 1, pro: false })),
		post(p, "pro", json({ re: "rej", aid: 1, pro: true })),
		post(p, "pro", json({ re: "rej", rec: "worker", recid, pro: true })),
		post(p, "pro", json({ re: "ref", rec: "worker", recid, pro: true })),
	]))
	await post(p, "pass", json({ nbr: nbr[2], code: code[1]?.pcode?.code }))
	assertEquals([null, 0, 1, 0, null, null, 1, null], await Promise.all([
		post(p, "pro", json({ re: "ref", uid: 1, pro: false })),
		post(p, "pro", json({ re: "ref", uid: 3, pro: false })),
		post(p, "pro", json({ re: "rej", uid: 3, pro: true })),
		post(p, "pro", json({ re: "rej", uid: 4, pro: true })),
		post(p, "pro", json({ re: "ref", sid: 1, pro: true })),
		post(p, "pro", json({ re: "rej", aid: 1, pro: true })),
		post(p, "pro", json({ re: "rej", rec: "worker", recid, pro: true })),
		post(p, "pro", json({ re: "ref", rec: "worker", recid, pro: true })),
	]))
	await Promise.all([
		...[1, 2, 3].map(user_d),
		...[1, 2, 3].map(aut_d),
		soc_d(1),
		agenda_d(1),
		rec_d(coll.worker, recid),
	])
})
