import { assert, assertEquals } from "https://deno.land/std@0.173.0/testing/asserts.ts"
import { coll, db } from "../src/db.ts"
import { act_c, act_d } from "../src/eid/act.ts"
import { agd_c, agd_d } from "../src/eid/agd.ts"
import { aut_c, aut_d } from "../src/eid/aut.ts"
import { rec_c, rec_d } from "../src/eid/rec.ts"
import { soc_c, soc_d } from "../src/eid/soc.ts"
import { usr_c, usr_d, usr_r } from "../src/eid/usr.ts"
import { jwk_set } from "../src/ont/jwt.ts"
import { Pas } from "../src/pra/pas.ts"
import { PasCode, pos } from "../src/pra/pos.ts"
import { PasPos } from "../src/pra/pos.ts"

await db("tst", true)
await jwk_set("testkey")

const json = JSON.stringify

Deno.test("pas", async () => {
	const nbr = "11111111111"
	const uid = await usr_c(nbr, [1, 2], "四川", "成都")
	assert(uid === 1)
	const p: PasPos = {}
	assert(null === await pos(p, "pas", ""))
	assertEquals(p, { pas: null })
	assertEquals(await pos(p, "pas", json({ nbr, sms: false })), { sms: false })
	const pascode = await pos(p, "pas", json({ nbr, sms: true })) as PasCode
	assert(pascode && pascode.sms === false && pascode.utc && pascode.utc > 0)
	const pcode = await usr_r({ _id: uid }, { pcode: 1 })
	assert(pcode && pcode.pcode && pcode.pcode.code > 0)
	const code = pcode.pcode.code
	assert(null === await pos(p, "pas", json({ nbr, code: code + 1 })))
	assertEquals(p, { pas: null })
	const pas = await pos(p, "pas", json({ nbr, code: code })) as Pas
	assert(p.jwt && p.jwt.length > 0 && p.pas && p.pas.id.uid === uid)
	const jwt = p.jwt
	assertEquals(p.pas, pas)
	assertEquals(await pos(p, "pas", ""), pas)
	assertEquals(p, { pas, jwt: null })
	assertEquals(await pos(p, "pas", ""), null)
	await pos(p, "pas", json({ nbr, code: code }))
	assertEquals(p.jwt, jwt)
	assertEquals(await pos(p, "pas", json({ uid: p.pas.id.uid })), 1)
	assertEquals(p, { pas: null, jwt: null })
	assertEquals(await usr_r({ _id: uid }, { ptoken: 1 }), { _id: uid })
	await usr_d(uid)
})

Deno.test("pre", async () => {
	const actid = ["111111", "111112"]
	const nbr = ["11111111111", "11111111112"]
	const utc = Date.now()
	const [adm1, adm2] = ["四川", "成都"]
	await act_c({ _id: actid[0], exp: utc + 1000, act: "usrnew", ref: [1] })
	await act_c({ _id: actid[1], exp: utc + 1000, act: "usrnbr", uid: 1 })
	assertEquals([1, null, 1, null], [
		await pos({}, "pre", json({ actid: actid[0], nbr: nbr[0], adm1, adm2 })),
		await pos({}, "pre", json({ actid: actid[0], nbr: nbr[0], adm1, adm2 })),
		await pos({}, "pre", json({ actid: actid[1], nbr: nbr[1], adm1, adm2 })),
		await pos({}, "pre", json({ actid: actid[1], nbr: nbr[1], adm1, adm2 })),
	])
	assertEquals({ _id: 1, nbr: nbr[1] }, await usr_r({ _id: 1 }, { nbr: 1 }))
	await Promise.all([
		usr_d(1),
		...actid.map(act_d),
	])
})

Deno.test("pro", async () => {
	const p: PasPos = {}
	const nbr = ["11111111111", "11111111112", "11111111113"]
	const utc = Date.now()
	const recid = { uid: 3, aid: 1, utc }
	assertEquals([
		await usr_c(nbr[0], [1, 2], "四川", "成都"),
		await usr_c(nbr[1], [1, 2], "广东", "汕头"),
		await usr_c(nbr[2], [2], "广东", "汕头"),
		{ sms: false }, { sms: false }, 1, 1,
		recid,
	], await Promise.all([
		aut_c({ _id: 1, p: ["pro_usr", "pro_soc", "pro_agd"] }),
		aut_c({ _id: 2, p: ["pro_usr", "pro_soc", "pro_agd"] }),
		aut_c({ _id: 3, p: ["pro_usr"] }),
		...[0, 2].map(n => pos(p, "pas", json({ nbr: nbr[n], sms: false }))),
		soc_c("团体", [1, 2], "四川", "成都", ""),
		agd_c("活动", [1, 2], "四川", "成都", ""),
		rec_c(coll.worker, { _id: recid, rej: [], ref: [1, 2], exp: utc + 10000, rol: "worker" })
	]))
	const code = await Promise.all([1, 3].map(_id => usr_r({ _id }, { pcode: 1 })))
	await pos(p, "pas", json({ nbr: nbr[0], code: code[0]?.pcode?.code }))
	assertEquals([null, 1, 0, 1, 1, 1, null, null], await Promise.all([
		pos(p, "pro", json({ re: "rej", uid: 2, pro: true })),
		pos(p, "pro", json({ re: "ref", uid: 3, pro: true })),
		pos(p, "pro", json({ re: "ref", sid: 1, pro: true })),
		pos(p, "pro", json({ re: "rej", sid: 1, pro: true })),
		pos(p, "pro", json({ re: "ref", aid: 1, pro: false })),
		pos(p, "pro", json({ re: "rej", aid: 1, pro: true })),
		pos(p, "pro", json({ re: "rej", rec: "worker", recid, pro: true })),
		pos(p, "pro", json({ re: "ref", rec: "worker", recid, pro: true })),
	]))
	await pos(p, "pas", json({ nbr: nbr[2], code: code[1]?.pcode?.code }))
	assertEquals([null, 0, 1, 0, null, null, 1, null], await Promise.all([
		pos(p, "pro", json({ re: "ref", uid: 1, pro: false })),
		pos(p, "pro", json({ re: "ref", uid: 3, pro: false })),
		pos(p, "pro", json({ re: "rej", uid: 3, pro: true })),
		pos(p, "pro", json({ re: "rej", uid: 4, pro: true })),
		pos(p, "pro", json({ re: "ref", sid: 1, pro: true })),
		pos(p, "pro", json({ re: "rej", aid: 1, pro: true })),
		pos(p, "pro", json({ re: "rej", rec: "worker", recid, pro: true })),
		pos(p, "pro", json({ re: "ref", rec: "worker", recid, pro: true })),
	]))
	await Promise.all([
		...[1, 2, 3].map(usr_d),
		...[1, 2, 3].map(aut_d),
		soc_d(1),
		agd_d(1),
		rec_d(coll.worker, recid),
	])
})
