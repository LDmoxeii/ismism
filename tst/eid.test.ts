import { db } from "../eid/db.ts"
import { usr_c, usr_d, usr_r, usr_u } from "../eid/usr.ts"
import { soc_r, soc_c, soc_d, soc_u } from "../eid/soc.ts";
import { agd_r, agd_c, agd_d, agd_u } from "../eid/agd.ts";
import { assertEquals } from "./mod.test.ts"

await db("tst", true)

Deno.test("usr", async () => {
	const nbr = "11111111111"
	assertEquals(null, await usr_r({ nbr }, { nbr: 1 }))
	const _id = await usr_c(nbr, "四川", "成都") as number
	assertEquals(1, _id)
	assertEquals({
		_id, nam: "1", msg: "", adm2: "成都", nbr,
	}, await usr_r({ nbr }, {
		nam: 1, msg: 1, adm2: 1, nbr: 1,
	}))
	assertEquals(1, await usr_u(_id, { $set: { nam: "中文名", adm1: "广东", adm2: "汕头", msg: "介绍" } }))
	assertEquals({
		_id: 1, nam: "中文名", adm2: "汕头", msg: "介绍",
	}, await usr_r({ nbr }, {
		nam: 1, msg: 1, adm2: 1,
	}))
	assertEquals(1, await usr_d(_id))
})

Deno.test("soc", async() => {
	const nam = "俱乐部"
	assertEquals(null, await soc_r(1))
	assertEquals(1, await soc_c(nam, "江苏", "苏州"))
	assertEquals({ _id: 1, nam, adm2: "苏州", sec: [], agr: { msg: "", utc: 0, }},
		await soc_r(1, { nam: 1, adm2: 1, sec: 1, agr: 1, }))
	assertEquals(1, await soc_u(1, { $set: {agr: {msg: "agr", utc: 1}}}))
	assertEquals({ _id: 1, agr: { msg: "agr", utc: 1, },},
		await soc_r(1, { agr: 1, }))
		assertEquals(1, await soc_d(1))
})

Deno.test("agd", async() => {
	const nam = "俱乐部"
	assertEquals(null, await agd_r(1))
	assertEquals(1, await agd_c(nam, "江苏", "苏州", 1))
	assertEquals({ _id: 1, nam, adm2: "苏州", msg: "",},
		await agd_r(1, { nam: 1, adm2: 1, msg: 1,}))
	assertEquals(1, await agd_u(1, { $set: {msg: "msg"}}))
	assertEquals({ _id: 1, msg: "msg", }, await agd_r(1, { msg: 1, }))
		assertEquals(1, await agd_d(1))
})