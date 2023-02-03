import { assert, assertEquals } from "https://deno.land/std@0.173.0/testing/asserts.ts"
import { coll, db } from "../src/db.ts"
import { act_c, act_d, act_r, act_u } from "../src/eidetic/act.ts"
import { agenda_c, agenda_d, agenda_r, agenda_u } from "../src/eidetic/agenda.ts"
import { aut_c, aut_d, aut_r, aut_u } from "../src/eidetic/aut.ts"
import { id, idname, is_id, is_intro, is_name, nid_of_adm, not_id, not_intro, not_name } from "../src/eidetic/id.ts"
import { is_role, not_role, nrec, rec_c, rec_d, rec_r, rec_u, urole } from "../src/eidetic/rec.ts"
import { soc_c, soc_d, soc_r, soc_u } from "../src/eidetic/soc.ts"
import { user_c, user_r, user_u, user_d } from "../src/eidetic/user.ts"

await db("tst", true)

Deno.test("id", async () => {
	assert(is_id(1) && is_id(9999))
	assert(not_id(undefined) && not_id(null) && not_id(0) && not_id(-2))

	assert(is_name("中文"))
	assert(not_name(undefined) && not_name(null))
	assert(not_name("abcd") && not_name("123") && not_name("中") && not_name("文".repeat(17)))

	assert(is_intro("") && is_intro("123abc") && is_intro("中文") && "文".repeat(4096))
	assert(not_intro(undefined) && not_intro(null) && not_intro("a".repeat(4097)))

	assert((await idname(coll.soc, [])).length === 0)
	assert((await idname(coll.soc, [1, 2, 3])).length === 0)
	assert((await id(coll.soc)).length === 0)
	assert((await id(coll.soc, { adm1: "成都" })).length === 0)
	assert((await nid_of_adm(coll.soc, "adm1")).length === 0)

	const sidname = ["社团一", "社团二", "社团三"]
	const sid = [
		await soc_c(sidname[0], [], "四川", "成都", ""),
		await soc_c(sidname[1], [], "四川", "成都", ""),
		await soc_c(sidname[2], [], "广东", "汕头", ""),
	].filter(is_id)
	assert(sid.length == 3)

	assertEquals(await idname(coll.soc, sid), sid.map((u, n) => [u, sidname[n]]))
	assertEquals(await id(coll.soc), sid.reverse())
	assertEquals(await id(coll.soc, { adm1: "广东" }), [3])
	assertEquals(await id(coll.soc, { adm2: "成都" }), [2, 1])
	assertEquals(await nid_of_adm(coll.soc, "adm1"), [["四川", 2], ["广东", 1]])
	assertEquals(await nid_of_adm(coll.soc, "adm2"), [["成都", 2], ["汕头", 1]])

	await Promise.all(sid.map(soc_d))
})

Deno.test("user", async () => {
	const nbr = "11111111114"
	assert(null === await user_r({ _id: 1 }, { nbr: 1 }))
	const r_c = await user_c(nbr, [], "四川", "成都")
	assert(r_c && r_c === 1)
	const u = await user_r({ _id: r_c }, { name: 1, intro: 1, adm2: 1, nbr: 1 })
	assert(u && u.name === "1" && u.intro.length === 0 && u.adm2 === "成都" && u.nbr === nbr)
	await user_u(r_c, { $set: { name: "中文名", adm1: "广东", adm2: "汕头", intro: "介绍" } })
	const u2 = await user_r({ _id: r_c }, { name: 1, adm2: 1, intro: 1 })
	assert(u2 && u2.name === "中文名" && u2.adm2 === "汕头" && u2.intro.length === 2)
	await user_u(r_c, { $addToSet: { ref: { $each: [1, 2, 3] } } })
	assertEquals(await user_u(r_c, { $addToSet: { ref: 2 } }), 0)
	assertEquals(await user_r({ _id: r_c }, { ref: 1 }), { _id: r_c, ref: [1, 2, 3] })
	await user_u(r_c, { $pull: { ref: 2 } })
	assertEquals(await user_r({ _id: r_c }, { ref: 1 }), { _id: r_c, ref: [1, 3] })
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
	await soc_u(r_c, { $set: { sec: [2], ref: [2], uid: [2] } })
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
	await agenda_u(r_c, { $set: { ref: [2], goal: [{ name: "目标", pct: 75 }], img: [{ name: "a", src: "b" }] } })
	const s2 = await agenda_r(r_c, { ref: 1, goal: 1, img: 1 })
	assertEquals(s2, { _id: 1, ref: [2], goal: [{ name: "目标", pct: 75 }], img: [{ name: "a", src: "b" }] })
	await agenda_d(r_c)
	assert(null === await agenda_r(r_c, {}))
})

Deno.test("rec", async () => {
	const utc = Date.now()
	const id = [
		{ uid: 1, aid: 4, utc },
		{ uid: 2, aid: 4, utc: utc + 100 },
		{ uid: 2, aid: 3, utc: utc + 200 },
	]

	assertEquals(await nrec(), { worker: 0, work: 0, fund: 0 })
	assertEquals(await nrec({ "_id.aid": 4 }), { worker: 0, work: 0, fund: 0 })
	assert(0 === (await rec_r(coll.worker, 0))?.length)
	assert(0 === (await rec_r(coll.work, utc))?.length)
	assert(0 === (await rec_r(coll.fund, utc, { "_id.uid": 2 }))?.length)

	assertEquals(id, await Promise.all(id.map(_id => rec_c(coll.worker, {
		_id, ref: [_id.uid, 3], rej: [], role: "sec", exp: utc + 10000
	}))))
	assertEquals(id, await Promise.all(id.map(_id => rec_c(coll.work, {
		_id, ref: [_id.uid], rej: [], work: "work", msg: "msg"
	}))))
	assertEquals(id, await Promise.all(id.map(_id => rec_c(coll.fund, {
		_id, ref: [_id.uid], rej: [], fund: 32, msg: "msg"
	}))))
	assertEquals(await nrec(), { worker: 3, work: 3, fund: 3 })
	assertEquals(await nrec({ "_id.uid": 2 }), { worker: 2, work: 2, fund: 2 })
	assertEquals(await nrec({ "_id.aid": 4 }), { worker: 2, work: 2, fund: 2 })

	const ur = await urole([2, 3, 4, 1])
	ur.sort((a, b) => a[0] - b[0])
	assertEquals(ur, [[1, [[4, "sec"]]], [2, [[3, "sec"], [4, "sec"]]]])
	assert(is_role(ur[0][1], [4, "sec"]))
	assert(is_role(ur[1][1], [3, "sec"]))
	assert(not_role(ur[1][1], [3, "worker"]))

	assertEquals((await rec_r(coll.worker, 0))!.length, 3)
	assertEquals((await rec_r(coll.work, utc + 100))!.length, 1)
	assertEquals((await rec_r(coll.fund, utc))!.map(r => r._id), id.slice(1).reverse())
	assertEquals((await rec_r(coll.worker, utc - 100, { "_id.aid": 4 }))!.map(r => r._id), id.slice(0, 2).reverse())
	assertEquals((await rec_r(coll.work, utc, { "_id.uid": 2 }))!.map(r => r._id), id.slice(1).reverse())
	assertEquals((await rec_r(coll.work, 0, { "_id.aid": 4 }, { work: "video" })), [])

	assertEquals(await rec_u(coll.work, id[1], { $set: { msg: "updated" } }), 1)
	assertEquals((await rec_r(coll.work, utc, { "_id.aid": 4 }, { work: "work" }))!
		.map(w => w.work == "work" ? w.msg : ""),
		["updated"]
	);

	await Promise.all([
		coll.worker, coll.work, coll.fund
	].flatMap(c => id.map(_id => rec_d(c, _id))))
	assertEquals(await nrec(), { worker: 0, work: 0, fund: 0 })
})

Deno.test("act", async () => {
	const _id = "111111"
	assert(null === await act_r(_id))
	await act_c({ _id, exp: Date.now() + 100000, act: "usernew", ref: [] })
	assertEquals((await act_r(_id))?.act, "usernew")
	await act_u(_id, { $set: { exp: Date.now() } })
	assert(null === await act_r(_id))
	assert(1 === await act_d(_id))
})

Deno.test("aut", async () => {
	const _id = 1
	assert(null === await aut_r(_id))
	await aut_c({ _id, p: ["a", "b"] })
	assertEquals((await aut_r(_id))?.p, ["a", "b"])
	await aut_u(_id, { $addToSet: { p: { $each: ["b", "c"] } } })
	await aut_u(_id, { $pull: { p: "a" } })
	assertEquals((await aut_r(_id))?.p, ["b", "c"])
	assert(1 === await aut_d(_id))
})
