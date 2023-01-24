import { assert } from "https://deno.land/std@0.173.0/testing/asserts.ts"
import { db } from "../src/db.ts"
import { user, user_delete, user_new, user_update } from "../src/eidetic/user.ts"

await db("tst", true)

Deno.test("user", async () => {
	assert(null === await user(1))
	const r_c = await user_new("11111111111", "四川", "成都")
	assert(r_c && r_c === 1)
	const u = await user(r_c)
	assert(u && u.name === "1" && u.intro.length === 0 && u.adm2 === "成都")
	await user_update(r_c, { name: "中文名", nbr: "11111111112", adm1: "广东", adm2: "汕头", intro: "介绍" })
	const u2 = await user(r_c)
	assert(u2 && u2.name === "中文名" && u2.intro.length > 0 && u2.adm2 === "汕头")
	await user_delete(r_c)
	assert(null === await user(r_c))
})
