import { assert, assertEquals } from "https://deno.land/std@0.173.0/testing/asserts.ts"
import { db } from "../src/db.ts"
import { agenda_c, agenda_d, agenda_r, agenda_u } from "../src/eidetic/agenda.ts"
import { is_id, is_intro, is_name, not_id, not_intro, not_name } from "../src/eidetic/id.ts"
import { soc_c, soc_d, soc_r, soc_u } from "../src/eidetic/soc.ts"
import { user_c, user_r, user_u, user_d } from "../src/eidetic/user.ts"

await db("tst", true)

Deno.test("id", () => {
	assert(is_id(1) && is_id(9999))
	assert(not_id(undefined) && not_id(null) && not_id(0) && not_id(-2))

	assert(is_name("中文"))
	assert(not_name(undefined) && not_name(null))
	assert(not_name("abcd") && not_name("123") && not_name("中") && not_name("文".repeat(17)))

	assert(is_intro("") && is_intro("123abc") && is_intro("中文") && "文".repeat(4096))
	assert(not_intro(undefined) && not_intro(null) && not_intro("a".repeat(4097)))
})

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
	await user_d(r_c)
	assert(null === await user_r({ _id: 1 }, { nbr: 1 }))
})

Deno.test("soc", async () => {
	const name = "社团"
	assert(null === await soc_r(1, {}))
	const r_c = await soc_c(name, [1], "四川", "成都", name)
	assert(r_c && r_c === 1)
	const s = await soc_r(r_c, { name: 1, intro: 1, adm1: 1, uid: 1 })
	assert(s && s.name === name && s.intro === name && s.adm1 === "四川" && s.uid.length === 0)
	await soc_u(r_c, { sec: [2], ref: [2], uid: [2] })
	const s2 = await soc_r(r_c, { sec: 1, ref: 1, uid: 1 })
	assertEquals(s2, { _id: 1, sec: [2], ref: [2], uid: [2] })
	await soc_d(r_c)
	assert(null === await soc_r(r_c, {}))
})

Deno.test("agenda", async () => {
	const name = "活动"
	assert(null === await agenda_r(1, {}))
	const r_c = await agenda_c(name, [1], "四川", "成都", name)
	assert(r_c && r_c === 1)
	const s = await agenda_r(r_c, { name: 1, intro: 1, adm1: 1, goal: 1 })
	assert(s && s.name === name && s.intro === name && s.adm1 === "四川" && s.goal.length === 0)
	await agenda_u(r_c, { ref: [2], goal: [{ name: "目标", pct: 75 }], img: [{ name: "a", src: "b" }] })
	const s2 = await agenda_r(r_c, { ref: 1, goal: 1, img: 1 })
	assertEquals(s2, { _id: 1, ref: [2], goal: [{ name: "目标", pct: 75 }], img: [{ name: "a", src: "b" }] })
	await agenda_d(r_c)
	assert(null === await agenda_r(r_c, {}))
})
