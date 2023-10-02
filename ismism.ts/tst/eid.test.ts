import { agd_c, agd_d, agd_r, agd_u } from "../src/eid/agd.ts"
import { db } from "../src/eid/db.ts"
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
