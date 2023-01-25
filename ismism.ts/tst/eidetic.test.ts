import { assert } from "https://deno.land/std@0.173.0/testing/asserts.ts"
import { db } from "../src/db.ts"
import { user_c, user_r, user_u, user_d } from "../src/eidetic/user.ts"

await db("tst", true)

Deno.test("user", async () => {
	const nbr = "11111111111"
	assert(null === await user_r({ _id: 1 }, { nbr: 1 }))
	const r_c = await user_c(nbr, [], "四川", "成都")
	assert(r_c && r_c === 1)
	const u = await user_r({ _id: r_c }, { name: 1, intro: 1, adm2: 1, nbr: 1 })
	assert(u && u.name === "1" && u.intro.length === 0 && u.adm2 === "成都" && u.nbr === nbr)
	await user_u(r_c, { name: "中文名", adm1: "广东", adm2: "汕头", intro: "介绍" })
	const u2 = await user_r({ _id: r_c }, { name: 1, adm2: 1, intro: 1 })
	assert(u2 && u2.name === "中文名" && u2.adm2 === "汕头" && u2.intro.length === 2)
	await user_d({ _id: r_c })
	assert(null === await user_r({ _id: 1 }, { nbr: 1 }))
})
