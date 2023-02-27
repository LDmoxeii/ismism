import type { Pas } from "../src/pra/pas.ts"
import { assert, assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts"
import { coll, db } from "../src/db.ts"
import { usr_c, usr_d, usr_r, usr_u } from "../src/eid/usr.ts"
import { jwk_set } from "../src/ont/jwt.ts"
import { PasCode, PasPos, pos } from "../src/pra/pos.ts"
import { aut_c, aut_d } from "../src/eid/aut.ts"
import { soc_c, soc_d, soc_u } from "../src/eid/soc.ts"
import { agd_c, agd_d, agd_u } from "../src/eid/agd.ts"
import { rec_c, rec_d } from "../src/eid/rec.ts"

await db("tst", true)
await jwk_set("testkey")

const json = JSON.stringify

Deno.test("pas", async () => {
	const nbr = "11111111111"
	const uid = await usr_c(nbr, "四川", "成都")
	assert(uid === 1)
	const p: PasPos = {}
	assert(null === await pos(p, "pas", ""))
	assertEquals(p, { etag: null, pas: null })
	assertEquals(await pos(p, "pas", json({ nbr, sms: false })), { sms: false })
	const pascode = await pos(p, "pas", json({ nbr, sms: true })) as PasCode
	assert(pascode && pascode.sms === false && pascode.utc && pascode.utc > 0)
	const pcode = await usr_r({ _id: uid }, { pcode: 1 })
	assert(pcode && pcode.pcode && pcode.pcode.code > 0)
	const code = pcode.pcode.code
	assert(null === await pos(p, "pas", json({ nbr, code: code + 1 })))
	assertEquals(p, { etag: null, pas: null })
	const pas = await pos(p, "pas", json({ nbr, code: code })) as Pas
	assert(p.jwt && p.jwt.length > 0 && p.pas && p.pas.uid === uid)
	const jwt = p.jwt
	assertEquals(p.pas, pas)
	assertEquals(await pos(p, "pas", ""), pas)
	assertEquals(p, { etag: null, pas, jwt: null })
	assertEquals(await pos(p, "pas", ""), null)
	await pos(p, "pas", json({ nbr, code: code }))
	assertEquals(p.jwt, jwt)
	assertEquals(await pos(p, "pas", json({ uid: p.pas.uid })), 1)
	assertEquals(p, { etag: null, pas: null, jwt: null })
	assertEquals(await usr_r({ _id: uid }, { ptoken: 1 }), { _id: uid })
	await usr_d(uid)
})

Deno.test("pro", async () => {
	const p: PasPos = {}
	const nbr = ["11111111111", "11111111112", "11111111113"]
	const utc = Date.now()
	const workid = { uid: 2, aid: 1, utc }
	await Promise.all([
		await usr_c(nbr[0], "四川", "成都"), usr_u(1, { $set: { ref: [1, 2] } }),
		await usr_c(nbr[1], "广东", "汕头"), usr_u(2, { $set: { ref: [1, 2] } }),
		await usr_c(nbr[2], "广东", "汕头"), usr_u(3, { $set: { ref: [2] } }),
		aut_c({ _id: 1 }), aut_c({ _id: 2 }),
		...[0, 2].map(n => pos(p, "pas", json({ nbr: nbr[n], sms: false }))),
		await soc_c("团体", "四川", "成都"), soc_u(1, { $set: { ref: [1, 2] } }),
		await agd_c("活动", "四川", "成都"), agd_u(1, { $set: { ref: [2], uid: [3] } }),
		rec_c(coll.work, { _id: workid, rej: [], ref: [1, 2], work: "work", msg: "msg" }),
	])
	const code = await Promise.all([1, 3].map(_id => usr_r({ _id }, { pcode: 1 })))
	await pos(p, "pas", json({ nbr: nbr[0], code: code[0]?.pcode?.code }))
	assertEquals([null, 1, 0, 1, 1, 1, null, null], await Promise.all([
		pos(p, "pro", json({ re: "rej", uid: 2, pro: true })),
		pos(p, "pro", json({ re: "ref", uid: 3, pro: true })),
		pos(p, "pro", json({ re: "ref", sid: 1, pro: true })),
		pos(p, "pro", json({ re: "rej", sid: 1, pro: true })),
		pos(p, "pro", json({ re: "ref", aid: 1, pro: true })),
		pos(p, "pro", json({ re: "rej", aid: 1, pro: true })),
		pos(p, "pro", json({ re: "rej", workid, pro: true })),
		pos(p, "pro", json({ re: "ref", workid, pro: true })),
	]))
	await pos(p, "pas", json({ nbr: nbr[2], code: code[1]?.pcode?.code }))
	assertEquals([null, null, null, null, null, null, 1, null], await Promise.all([
		pos(p, "pro", json({ re: "ref", uid: 1, pro: false })),
		pos(p, "pro", json({ re: "ref", uid: 3, pro: false })),
		pos(p, "pro", json({ re: "rej", uid: 3, pro: true })),
		pos(p, "pro", json({ re: "rej", uid: 4, pro: true })),
		pos(p, "pro", json({ re: "ref", sid: 1, pro: true })),
		pos(p, "pro", json({ re: "rej", aid: 1, pro: true })),
		pos(p, "pro", json({ re: "rej", workid, pro: true })),
		pos(p, "pro", json({ re: "ref", workid, pro: true })),
	]))
	await Promise.all([
		...[1, 2, 3].map(usr_d),
		...[1, 2, 3].map(aut_d),
		soc_d(1), agd_d(1),
		rec_d(coll.work, workid),
	])
})

