import type { Rec } from "../src/eid/typ.ts"
import type { Pas } from "../src/pra/pas.ts"
import { assert, assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts"
import { coll, db } from "../src/db.ts"
import { usr_c, usr_d, usr_r, usr_u } from "../src/eid/usr.ts"
import { jwk_set } from "../src/ont/jwt.ts"
import { PasCode, PasPos, pos } from "../src/pra/pos.ts"
import { aut_c, aut_d } from "../src/eid/aut.ts"
import { soc_c, soc_d, soc_r, soc_u } from "../src/eid/soc.ts"
import { agd_c, agd_d, agd_r, agd_u } from "../src/eid/agd.ts"
import { rec_c, rec_d, rec_f } from "../src/eid/rec.ts"
import { act_c, act_d } from "../src/eid/act.ts"
import { lim_re } from "../src/eid/is.ts"

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

Deno.test("pre", async () => {
	const p: PasPos = {}
	const actid = ["111111", "111112", "111113"]
	const nbr = ["11111111111", "11111111112", "11111111113"]
	const utc = Date.now()
	const [adm1, adm2] = ["四川", "成都"]
	await Promise.all([
		act_c({ _id: actid[0], exp: utc + 1000, act: "fund", aid: 1, msg: "msg" }),
		act_c({ _id: actid[1], exp: utc + 1000, act: "fund", aid: 2, msg: "msg" }),
		act_c({ _id: actid[2], exp: utc + 1000, act: "nbr", uid: 1 }),
		aut_c({ _id: 1 }),
	])
	assertEquals([1, null, 1, null], [
		await pos({}, "pre", json({ actid: actid[0], nbr: nbr[0], adm1, adm2 })),
		await pos({}, "pre", json({ actid: actid[0], nbr: nbr[0], adm1, adm2 })),
		await pos({}, "pre", json({ actid: actid[2], nbr: nbr[1], adm1, adm2 })),
		await pos({}, "pre", json({ actid: actid[2], nbr: nbr[1], adm1, adm2 })),
	])
	assertEquals({ _id: 1, nbr: nbr[1] }, await usr_r({ _id: 1 }, { nbr: 1 }))
	await Promise.all([
		pos(p, "pas", json({ nbr: nbr[1], sms: false })),
		usr_u(1, { $set: { ref: [1, 2] } }),
	])
	const pcode = await usr_r({ _id: 1 }, { pcode: 1 })
	await pos(p, "pas", json({ nbr: nbr[1], code: pcode?.pcode?.code }))
	const jwt = p.jwt
	assertEquals([2, 1, 1], await Promise.all([
		pos({ jwt }, "pre", json({ nbr: nbr[2], adm1, adm2 })),
		pos({ jwt }, "pre", json({ snam: "社团", adm1, adm2 })),
		pos({ jwt }, "pre", json({ anam: "活动", adm1, adm2 })),
	]))
	await agd_u(1, { $set: { ref: [1, 2], uid: [1] } })
	await pos({ jwt }, "pas", json({ nbr: nbr[1], code: pcode?.pcode?.code }))
	const w = [
		await pos({ jwt }, "pre", json({ actid: actid[1] })),
		await pos({ jwt }, "pre", json({ aid: 1, msg: "msg" })),
		await pos({ jwt }, "pre", json({ aid: 1, nam: "nam", src: "httpsrc" })),
	] as Rec["_id"][]
	assertEquals([2, 1, 1], w.map(w => w.aid))
	await Promise.all([
		usr_d(1), usr_d(2), soc_d(1), agd_d(1),
		rec_d(coll.fund, w[0]), rec_d(coll.work, w[1]), rec_d(coll.work, w[2]),
		aut_d(1), ...actid.map(act_d),
	])
})

Deno.test("pro", async () => {
	const p: PasPos = {}
	const nbr = ["11111111111", "11111111112", "11111111113"]
	const utc = Date.now()
	const workid = { uid: 2, aid: 1, utc }
	const rej = new Array(lim_re).fill(0).map((_, n) => n + 1)
	await Promise.all([
		await usr_c(nbr[0], "四川", "成都"), usr_u(1, { $set: { ref: [1, 2] } }),
		await usr_c(nbr[1], "广东", "汕头"), usr_u(2, { $set: { ref: [1, 2] } }),
		await usr_c(nbr[2], "广东", "汕头"), usr_u(3, { $set: { ref: [2] } }),
		aut_c({ _id: 1 }), aut_c({ _id: 2 }),
		...[0, 2].map(n => pos(p, "pas", json({ nbr: nbr[n], sms: false }))),
		await soc_c("团体", "四川", "成都"), soc_u(1, { $set: { ref: [1, 2] } }),
		await agd_c("活动", "四川", "成都"), agd_u(1, { $set: { ref: [2], uid: [3] } }),
		rec_c(coll.work, { _id: workid, rej, ref: [1, 2], work: "work", msg: "msg" }),
	])
	const code = await Promise.all([1, 3].map(_id => usr_r({ _id }, { pcode: 1 })))
	await pos(p, "pas", json({ nbr: nbr[0], code: code[0]?.pcode?.code }))
	assertEquals([null, 1, 0, 1, 1, 1, null, null], await Promise.all([
		pos(p, "pro", json({ re: "rej", uid: 2, add: true })),
		pos(p, "pro", json({ re: "ref", uid: 3, add: true })),
		pos(p, "pro", json({ re: "ref", sid: 1, add: true })),
		pos(p, "pro", json({ re: "rej", sid: 1, add: true })),
		pos(p, "pro", json({ re: "ref", aid: 1, add: true })),
		pos(p, "pro", json({ re: "rej", aid: 1, add: true })),
		pos(p, "pro", json({ re: "rej", workid, add: true })),
		pos(p, "pro", json({ re: "ref", workid, add: true })),
	]))
	await pos(p, "pas", json({ nbr: nbr[2], code: code[1]?.pcode?.code }))
	assertEquals([null, null, null, null, null, null, null, 1, 1, null], await Promise.all([
		pos(p, "pro", json({ re: "ref", uid: 1, add: false })),
		pos(p, "pro", json({ re: "ref", uid: 3, add: false })),
		pos(p, "pro", json({ re: "rej", uid: 3, add: true })),
		pos(p, "pro", json({ re: "rej", uid: 4, add: true })),
		pos(p, "pro", json({ re: "ref", sid: 1, add: true })),
		pos(p, "pro", json({ re: "rej", aid: 1, add: true })),
		pos(p, "pro", json({ re: "rej", workid, add: true })),
		pos(p, "pro", json({ re: "rej", workid, add: false })),
		pos(p, "pro", json({ re: "rej", workid, add: true })),
		pos(p, "pro", json({ re: "ref", workid, add: true })),
	]))
	await Promise.all([
		...[1, 2, 3].map(usr_d),
		...[1, 2, 3].map(aut_d),
		soc_d(1), agd_d(1),
		rec_d(coll.work, workid),
	])
})

Deno.test("put", async () => {
	const p: PasPos = {}
	const nbr = "11111111111"
	const utc = Date.now()
	const workid = { uid: 1, aid: 1, utc }
	await Promise.all([
		await usr_c(nbr, "四川", "成都"), usr_u(1, { $set: { ref: [1, 2] } }),
		await soc_c("社团", "江苏", "苏州"), soc_u(1, { $set: { ref: [1, 2] } }),
		await agd_c("活动", "江苏", "苏州"), agd_u(1, { $set: { ref: [1, 2] } }),
		rec_c(coll.work, { _id: workid, ref: [], rej: [], work: "work", msg: "msg" }),
		aut_c({ _id: 1 }),
		pos(p, "pas", json({ nbr, sms: false })),
	])
	const code = await usr_r({ _id: 1 }, { pcode: 1 })
	await pos(p, "pas", json({ nbr, code: code?.pcode?.code }))
	const jwt = p.jwt
	const uu = { nam: "用户一", adm1: "广东", adm2: "汕头", intro: "简介" }
	const su = { sid: 1, nam: "社团一", adm1: "广东", adm2: "汕头", uidlim: 8 }
	const au = { aid: 1, nam: "活动一", adm1: "广东", adm2: "汕头", uidlim: 8 }
	const aus = { aid: 1, intro: "简介", reslim: 10, account: "http明细", budget: 9, fund: 9, expense: 9 }
	await Promise.all([
		pos({ jwt }, "put", json(uu)),
		pos({ jwt }, "put", json(su)),
		pos({ jwt }, "put", json(au)),
		await pos({ jwt }, "put", json({ aid: 1, rol: "sec", uid: 1, add: true })),
		pos({ jwt }, "put", json(aus)),
		await pos({ jwt }, "put", json({ aid: 1, rol: "res", uid: 1, add: true })),
		await pos({ jwt }, "put", json({ aid: 1, rol: "res", uid: 2, add: true })),
		pos({ jwt }, "put", json({ aid: 1, rol: "uid", uid: 1, add: true })),
		pos({ jwt }, "put", json({ aid: 1, rol: "uid", uid: 2, add: true })),
		pos({ jwt }, "put", json({ workid, msg: "updated" })),
	])
	assertEquals({ _id: 1, ...uu }, await usr_r({ _id: 1 }, { nam: 1, adm1: 1, adm2: 1, intro: 1 }))
	assertEquals({ _id: 1, nam: su.nam, uidlim: su.uidlim }, await soc_r(1, { nam: 1, uidlim: 1 }))
	assertEquals({
		_id: 1, nam: au.nam, intro: aus.intro,
		sec: [1], uid: [1], res: [],
		uidlim: au.uidlim, reslim: aus.reslim,
		expense: aus.expense,
	}, await agd_r(1, {
		nam: 1, intro: 1, sec: 1, uid: 1, res: 1, uidlim: 1, reslim: 1, expense: 1,
	}))
	await pos({ jwt }, "put", json({ aid: 1, rol: "uid" }))
	assertEquals({ _id: 1, uid: [] }, await agd_r(1, { uid: 1 }))
	assertEquals([{ _id: workid, ref: [], rej: [], work: "work", msg: "updated" }], await rec_f(coll.work, 0))
})
