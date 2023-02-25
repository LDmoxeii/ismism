import { assert, assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts"
import { db } from "../src/db.ts"
import { usr_c, usr_r, usr_u, usr_d } from "../src/eid/usr.ts"
import { soc_c, soc_d, soc_r, soc_u } from "../src/eid/soc.ts"
import { agd_c, agd_d, agd_r, agd_u } from "../src/eid/agd.ts"

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

Deno.test("soc", async () => {
	const nam = "社团"
	assert(null === await soc_r(1, {}))
	const r_c = await soc_c(nam, "四川", "成都")
	assert(r_c && r_c === 1)
	const s = await soc_r(r_c, { nam: 1, intro: 1, adm1: 1, uid: 1 })
	assert(s && s.nam === nam && s.adm1 === "四川" && s.uid.length === 0)
	await soc_u(r_c, { $set: { sec: [2], ref: [2], uid: [2, 3, 4] } })
	const s2 = await soc_r(r_c, { sec: 1, ref: 1, uid: 1 })
	assertEquals(s2, { _id: 1, sec: [2], ref: [2], uid: [2, 3, 4] })
	await soc_d(r_c)
	assert(null === await soc_r(r_c, {}))
})

Deno.test("agd", async () => {
	const nam = "活动"
	assert(null === await agd_r(1, {}))
	const r_c = await agd_c(nam, "四川", "成都")
	assert(r_c && r_c === 1)
	const s = await agd_r(r_c, { nam: 1, intro: 1, adm1: 1, goal: 1 })
	assert(s && s.nam === nam && s.adm1 === "四川" && s.goal.length === 0)
	await agd_u(r_c, { $set: { ref: [2], goal: [{ nam: "目标", pct: 75 }], img: [{ nam: "a", src: "b" }] } })
	const s2 = await agd_r(r_c, { ref: 1, goal: 1, img: 1 })
	assertEquals(s2, { _id: 1, ref: [2], goal: [{ nam: "目标", pct: 75 }], img: [{ nam: "a", src: "b" }] })
	await agd_d(r_c)
	assert(null === await agd_r(r_c, {}))
})
