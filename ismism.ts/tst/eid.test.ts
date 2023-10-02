import { db } from "../src/eid/db.ts"
import { usr_c, usr_d, usr_r, usr_u } from "../src/eid/usr.ts"
import { assertEquals } from "./mod.ts"

await db("tst", true)

Deno.test("usr", async () => {
	const nbr = "11111111111"
	assertEquals(null, await usr_r({ _id: 1 }, { nbr: 1 }))
	const uid = await usr_c(nbr, "四川", "成都") as number
	assertEquals(1, uid)
	assertEquals({
		_id: uid, nam: `${uid}`, msg: "", adm2: "成都", nbr
	}, await usr_r(
		{ _id: uid }, { nam: 1, msg: 1, adm2: 1, nbr: 1 })
	)
	await usr_u(uid, { $set: { nam: "中文名", adm1: "广东", adm2: "汕头", rej: [2], msg: "介绍" } })
	assertEquals({
		_id: uid, nam: "中文名", adm2: "汕头", msg: "介绍"
	}, await usr_r(
		{ _id: uid }, { nam: 1, adm2: 1, msg: 1 })
	)
	assertEquals(1, await usr_d(uid))
	assertEquals(null, await usr_r({ _id: 1 }, { nbr: 1 }))
})
