import { db } from "../eid/db.ts"
import { usr_c, usr_d, usr_r, usr_u } from "../eid/usr.ts"
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
