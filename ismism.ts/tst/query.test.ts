import { assert } from "https://deno.land/std@0.154.0/testing/asserts.ts";
import type { RecOf } from "../src/db.ts"
import { Agenda, query, Recent, Soc, User } from "../src/query.ts"
import type { Work, Worker, Fund } from "../src/typ.ts"


function p(
	// deno-lint-ignore no-explicit-any
	obj: any
) {
	return new URLSearchParams(Object.entries(obj).map(([k, v]) => [k, `${v}`]))
}

Deno.test("user", async () => {
	const u = await query("user", p({ uid: 728 })) as User
	assert(u && u.name === "万大可")
	assert(u.rec.worker === 1 && u.rec.work === 2 && u.rec.fund === 3)
	const [worker, work, fund] = await Promise.all([
		await query("rec_of_uid", p({ coll: "worker", uid: 728 })) as RecOf<Worker>,
		await query("rec_of_uid", p({ coll: "work", uid: 728 })) as RecOf<Work>,
		await query("rec_of_uid", p({ coll: "fund", uid: 728 })) as RecOf<Fund>,
	])
	assert(worker.rec.length === 1 && work.rec.length === 2 && fund.rec.length === 3)
})

Deno.test("soc", async () => {
	const s = await query("soc", p({ sid: 2 })) as Soc
	assert(s && s.name === "主义主义软件开发小组")
	const uname = new Map(s.uname)
	assert(uname.get(s.uid[1]) === "万大可")
	assert(s.rec.worker === 2 && s.rec.work === 4 && s.rec.fund === 3)
	const [worker, work, fund] = await Promise.all([
		await query("rec_of_sid", p({ coll: "worker", sid: 2 })) as RecOf<Worker>,
		await query("rec_of_sid", p({ coll: "work", sid: 2 })) as RecOf<Work>,
		await query("rec_of_sid", p({ coll: "fund", sid: 2 })) as RecOf<Fund>,
	])
	assert(worker.rec.length === 2 && work.rec.length === 4 && fund.rec.length === 3)
})

Deno.test("agenda", async () => {
	const a = await query("agenda", p({})) as Agenda
	const a4 = a[a.length - 4]
	const a1 = a[a.length - 1]
	assert(a.length === 4 && a4._id === 4)
	assert(a1.rec.worker === 6 && a1.rec.work === 8 && a1.rec.fund === 6)
	const [worker, work, fund] = await Promise.all([
		await query("rec_of_aid", p({ coll: "worker", aid: a1._id })) as RecOf<Worker>,
		await query("rec_of_aid", p({ coll: "work", aid: a1._id })) as RecOf<Work>,
		await query("rec_of_aid", p({ coll: "fund", aid: a1._id })) as RecOf<Fund>,
	])
	assert(worker.rec.length === 6 && work.rec.length === 8 && fund.rec.length === 6)
	assert(a4.dat?.typ === "imgsrc" && a4.dat.img.length === 5 && a1.dat === null)
})

Deno.test("recent", async () => {
	const r = await query("recent", p({})) as Recent
	const [worker, work, fund] = await Promise.all([
		await query("rec_of_recent", p({ coll: "worker", utc: Date.now() })) as RecOf<Worker>,
		await query("rec_of_recent", p({ coll: "work", utc: Date.now() })) as RecOf<Work>,
		await query("rec_of_recent", p({ coll: "fund", utc: Date.now() })) as RecOf<Fund>,
	])
	assert(worker.rec.length === r.worker && work.rec.length == r.work && fund.rec.length == r.fund)
})
