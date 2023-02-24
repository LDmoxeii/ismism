import { assert, assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts"
import { db } from "../src/db.ts"
import { usr_c, usr_r, usr_u, usr_d } from "../src/eid/usr.ts"

await db("tst", true)

Deno.test("usr", async () => {
	const nbr = "11111111114"
	assert(null === await usr_r({ _id: 1 }, { nbr: 1 }))
	const r_c = await usr_c(nbr, "四川", "成都")
	assert(r_c && r_c === 1)
	const u = await usr_r({ _id: r_c }, { nam: 1, intro: 1, adm2: 1, nbr: 1 })
	assert(u && u.nam === "1" && u.intro.length === 0 && u.adm2 === "成都" && u.nbr === nbr)
	await usr_u(r_c, { $set: { nam: "中文名", adm1: "广东", adm2: "汕头", intro: "介绍" } })
	const u2 = await usr_r({ _id: r_c }, { nam: 1, adm2: 1, intro: 1 })
	assert(u2 && u2.nam === "中文名" && u2.adm2 === "汕头" && u2.intro.length === 2)
	await usr_u(r_c, { $addToSet: { ref: { $each: [1, 2, 3] } } })
	assertEquals(await usr_u(r_c, { $addToSet: { ref: 2 } }), 0)
	assertEquals(await usr_r({ _id: r_c }, { ref: 1 }), { _id: r_c, ref: [1, 2, 3] })
	await usr_u(r_c, { $pull: { ref: 2 } })
	assertEquals(await usr_r({ _id: r_c }, { ref: 1 }), { _id: r_c, ref: [1, 3] })
	await usr_d(r_c)
	assert(null === await usr_r({ _id: 1 }, { nbr: 1 }))
})
