import { agd_c, agd_d, agd_r, agd_u } from "../src/eid/agd.ts"
import { aut_c, aut_g } from "../src/eid/aut.ts";
import { db, coll } from "../src/eid/db.ts"
import { msg_c, msg_f, msg_r, msg_u } from "../src/eid/msg.ts";
import { rec_c, rec_d, rec_f, rec_r, rec_s, rec_a } from "../src/eid/rec.ts"
import { soc_c, soc_d, soc_r, soc_u } from "../src/eid/soc.ts"
import { usr_c, usr_d, usr_r, usr_u } from "../src/eid/usr.ts"
import { assertEquals } from "./mod.ts"

await db("tst", true)

Deno.test("usr", async () => {
	const nbr = "11111111111"
	assertEquals(null, await usr_r({ _id: 1 }, { nbr: 1 }))
	const uid = await usr_c(nbr, "四川", "成都") as number
	assertEquals(1, uid)
	assertEquals({
		_id: uid, nam: `${uid}`, msg: "", adm2: "成都", nbr,
	}, await usr_r(
		{ _id: uid }, { nam: 1, msg: 1, adm2: 1, nbr: 1 })
	)
	await usr_u(uid, { $set: { nam: "中文名", adm1: "广东", adm2: "汕头", msg: "介绍" } })
	assertEquals({
		_id: uid, nam: "中文名", adm2: "汕头", msg: "介绍"
	}, await usr_r(
		{ _id: uid }, { nam: 1, adm2: 1, msg: 1 })
	)
	assertEquals(1, await usr_d(uid))
	assertEquals(null, await usr_r({ _id: 1 }, { nbr: 1 }))
})

Deno.test("soc", async () => {
	const nam = "俱乐部"
	assertEquals(null, await soc_r(1, {}))
	assertEquals(1, await soc_c(nam, "四川", "成都"))
	assertEquals(await soc_r(1, { nam: 1, msg: 1, adm1: 1, sec: 1 }), {
		_id: 1, nam, adm1: "四川", msg: "", sec: []
	})
	await soc_u(1, { $set: { msg: "msg", sec: [2] } })
	assertEquals(await soc_r(1, { msg: 1, sec: 1 }), { _id: 1, msg: "msg", sec: [2] })
	assertEquals(1, await soc_d(1))
})

Deno.test("agd", async () => {
	const nam = "活动"
	assertEquals(null, await agd_r(1, {}))
	assertEquals(1, await agd_c(nam, "四川", "成都", 1))
	assertEquals(await agd_r(1, { nam: 1, msg: 1, adm1: 1, soc: 1 }), {
		_id: 1, nam, adm1: "四川", msg: "", soc: 1
	})
	await agd_u(1, { $set: { msg: "msg" } })
	assertEquals(await agd_r(1, { msg: 1 }), { _id: 1, msg: "msg", })
	assertEquals(1, await agd_d(1))
})

Deno.test("rec", async () => {
	const [usr, soc, utc, msg, amt] = [1, 2, 1, "msg", 1]
	await Promise.all([
		rec_c(coll.cdt, { _id: { usr, soc, utc }, msg, amt, utc: { eft: 1, exp: 2 } }),
		rec_c(coll.cdt, { _id: { usr, soc, utc: utc + 1 }, msg, amt, utc: { eft: 2, exp: 5 } }),
		rec_c(coll.cdt, { _id: { usr, soc, utc: utc + 2 }, msg, amt, utc: { eft: 3, exp: 5 } }),
	])
	assertEquals([await rec_r(coll.cdt, { usr, soc, utc })], await rec_f(coll.cdt, { usr }, utc + 1))
	assertEquals([2], await rec_a(coll.cdt, usr, 4))
	assertEquals(3, await rec_s(coll.cdt, { usr }, {}))
	assertEquals(2, await rec_s(coll.cdt, { soc }, { now: 4 }))
	assertEquals(1, await rec_s(coll.cdt, { usr }, { eft: 2 }))
	assertEquals(3, await rec_s(coll.cdt, { usr }, { exp: 6 }))
	assertEquals(1, await rec_d(coll.cdt, { usr, soc, utc }))
	assertEquals(2, await rec_s(coll.cdt, { usr }, { exp: 6 }))
})

Deno.test("msg", async () => {
	assertEquals([], await msg_f(coll.wsl, 0))
	assertEquals(1, await msg_c(coll.wsl, "标题", 2))
	assertEquals(2, await msg_c(coll.wsl, "标题", 2))
	assertEquals(1, await msg_u(coll.wsl, 1, { $set: { msg: "#md1", usr: 2, pin: true } }))
	assertEquals(1, await msg_u(coll.wsl, 2, { $set: { msg: "#md2", usr: 2 } }))
	const [m1, m2] = await Promise.all([msg_r(coll.wsl, 1), msg_r(coll.wsl, 2)])
	assertEquals(m2!.msg, "#md2")
	assertEquals([m1, m2], await msg_f(coll.wsl, 0))
	assertEquals([], await msg_f(coll.wsl, 2))
})

Deno.test("aut", async () => {
	assertEquals({}, await aut_g())
	await Promise.all([
		aut_c({ _id: 1, aut: ["sup", "wsl"] }),
		aut_c({ _id: 2, aut: ["sup", "aut"] }),
		aut_c({ _id: 3, aut: ["lit", "wsl"] }),
	])
	assertEquals({ sup: [1, 2], aut: [2], lit: [3], wsl: [1, 3] }, await aut_g())
})
