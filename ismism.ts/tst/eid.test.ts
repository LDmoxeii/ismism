import { assert, assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts"
import { coll, db } from "../src/db.ts"
import { usr_c, usr_r, usr_u, usr_d } from "../src/eid/usr.ts"
import { soc_c, soc_d, soc_r, soc_u } from "../src/eid/soc.ts"
import { agd_c, agd_d, agd_r, agd_u } from "../src/eid/agd.ts"
import { nrec, rec_c, rec_d, rec_f, rec_r, rec_u } from "../src/eid/rec.ts"
import { rolref, rol } from "../src/eid/rel.ts"

await db("tst", true)

Deno.test("usr", async () => {
	const nbr = "11111111111"
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

Deno.test("rel", async () => {
	assertEquals([
		await usr_c("11111111111", "四川", "成都"),
		await soc_c("社团一", "广东", "汕头"),
		await soc_c("社团二", "四川", "成都"),
		await soc_c("社团三", "广东", "汕头"),
	], [1, 1, 2, 3])
	await Promise.all([
		usr_u(1, { $set: { ref: [1, 2, 3] } }),
		soc_u(1, { $set: { ref: [3, 4], sec: [1, 4], uid: [1, 3], res: [] } }),
		soc_u(2, { $set: { ref: [2, 3], sec: [1, 4], uid: [1, 3], res: [1, 2] } }),
		soc_u(3, { $set: { ref: [], sec: [2, 3], uid: [1, 3], res: [1, 2] } }),
	])
	assertEquals(await rolref(coll.soc, 1), {
		sec: [[1, 1], [2, 2]],
		uid: [[1, 2], [2, 3], [3, 2]],
		res: [[2, 3], [3, 2]],
	})
	assertEquals(await rol(coll.soc, 1), { sec: [2], uid: [1, 2, 3], res: [2, 3] })
})

Deno.test("rec", async () => {
	const utc = Date.now()
	const id = [
		{ uid: 1, aid: 4, utc },
		{ uid: 2, aid: 4, utc: utc + 100 },
		{ uid: 2, aid: 3, utc: utc + 200 },
	]

	assertEquals(await nrec(), { work: 0, fund: 0 })
	assertEquals(await nrec({ aid: 4 }), { work: 0, fund: 0 })
	assert(0 === (await rec_f(coll.work, 0))?.length)
	assert(0 === (await rec_f(coll.fund, utc, { uid: [2] }))?.length)

	assertEquals(id, await Promise.all(id.map(_id => rec_c(coll.work, {
		_id, ref: [_id.uid], rej: [], work: "work", msg: "msg"
	}))))
	assertEquals(id, await Promise.all(id.map(_id => rec_c(coll.fund, {
		_id, fund: 32, msg: "msg"
	}))))
	assertEquals(await nrec(), { work: 3, fund: 3 })
	assertEquals(await nrec({ uid: [2] }), { work: 2, fund: 2 })
	assertEquals(await nrec({ aid: 4 }), { work: 2, fund: 2 })

	assertEquals((await rec_f(coll.work, utc + 100))!.length, 1)
	assertEquals((await rec_f(coll.fund, utc))!.map(r => r._id), id.slice(1).reverse())
	assertEquals((await rec_f(coll.work, utc, { uid: [2] }))!.map(r => r._id), id.slice(1).reverse())
	assertEquals((await rec_f(coll.work, 0, { aid: 3 })), [{ _id: id[2], work: "work", msg: "msg", ref: [2], rej: [] }])

	assertEquals(await rec_u(coll.work, id[1], { $set: { msg: "updated" } }), 1)
	// deno-lint-ignore no-explicit-any
	assertEquals(await rec_r(coll.work, id[1], { _id: 0, msg: 1 } as any), { msg: "updated" } as any)

	await Promise.all([
		id.map(_id => rec_d(coll.work, _id)),
		id.map(_id => rec_d(coll.fund, _id)),
	].flat())
	assertEquals(await nrec(), { work: 0, fund: 0 })
})

