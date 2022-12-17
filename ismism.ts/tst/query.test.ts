import { assert, assertEquals } from "https://deno.land/std@0.154.0/testing/asserts.ts";
import type { RecOf } from "../src/db.ts"
import { Agenda, query, Soc, User } from "../src/query.ts"
import type { Work, Worker, Fund } from "../src/typ.ts"


function p(
	// deno-lint-ignore no-explicit-any
	obj: any
) {
	return new URLSearchParams(Object.entries(obj).map(([k, v]) => [k, `${v}`]))
}

Deno.test("user", async () => {
	const u = await query("user", p({ uid: 728 })) as User
	assert(u && u.name === "万大可" && u.intro == "")
	assertEquals(u.referer, [1, 2])
	const uname = new Map(u.uname)
	assert(uname.get(u.referer[0]) === "未明子")
	const [worker, work, fund] = await Promise.all([
		await query("rec_of_uid", p({ coll: "worker", uid: 728 })) as RecOf<Worker>,
		await query("rec_of_uid", p({ coll: "work", uid: 728 })) as RecOf<Work>,
		await query("rec_of_uid", p({ coll: "fund", uid: 728 })) as RecOf<Fund>,
	])
	assert(worker.rec.length === 1 && work.rec.length === 2 && fund.rec.length === 3)
	assertEquals(work.urole, [[728, [[1, "志愿者"]]]])
})

Deno.test("soc", async () => {
	const s = await query("soc", p({ sid: 2 })) as Soc
	assert(s && s.name === "主义主义软件开发小组" && s.uid_max === 128)
	assertEquals(s.referer, [1, 2])
	assertEquals(s.sec, [728])
	const uname = new Map(s.uname)
	assert(uname.get(s.uid[1]) === "万大可" && uname.get(s.referer[0]) === "未明子")
	assert(s.nrec.worker === 2 && s.nrec.work === 4 && s.nrec.fund === 3)
	const [worker, work, fund] = await Promise.all([
		await query("rec_of_sid", p({ coll: "worker", sid: 2 })) as RecOf<Worker>,
		await query("rec_of_sid", p({ coll: "work", sid: 2 })) as RecOf<Work>,
		await query("rec_of_sid", p({ coll: "fund", sid: 2 })) as RecOf<Fund>,
	])
	assert(worker.rec.length === 2 && work.rec.length === 4 && fund.rec.length === 3)
	assertEquals(work.urole.sort(), [[137, [[1, "志愿者"]]], [728, [[1, "志愿者"]]]].sort())
})

Deno.test("agenda", async () => {
	const { agenda: a } = await query("agenda", p({})) as Agenda
	const a4 = a[a.length - 4]
	const a1 = a[a.length - 1]
	assert(a.length === 4 && a4._id === 4)
	assert(a1.nrec.worker === 6 && a1.nrec.work === 8 && a1.nrec.fund === 6)
	assertEquals(a1.referer, [1, 2])
	assertEquals(a4.referer, [1, 2])
	const [worker, work, fund] = await Promise.all([
		await query("rec_of_aid", p({ coll: "worker", aid: a1._id })) as RecOf<Worker>,
		await query("rec_of_aid", p({ coll: "work", aid: a1._id })) as RecOf<Work>,
		await query("rec_of_aid", p({ coll: "fund", aid: a1._id })) as RecOf<Fund>,
	])
	assert(worker.rec.length === 6 && work.rec.length === 8 && fund.rec.length === 6)
	assert(a4.imgsrc && a4.imgsrc.img.length === 4 && a1.imgsrc === undefined)
	assert(worker.urole.length === worker.rec.length)
})

Deno.test("recent", async () => {
	const { nrec: r } = await query("agenda", p({})) as Agenda
	const [worker, work, fund] = await Promise.all([
		await query("rec_of_recent", p({ coll: "worker", utc: Date.now() })) as RecOf<Worker>,
		await query("rec_of_recent", p({ coll: "work", utc: Date.now() })) as RecOf<Work>,
		await query("rec_of_recent", p({ coll: "fund", utc: Date.now() })) as RecOf<Fund>,
	])
	assert(worker.rec.length === r.worker && work.rec.length == r.work && fund.rec.length == r.fund)
})
