import { assert } from "https://deno.land/std@0.154.0/testing/asserts.ts";
import { rec_of_aid, rec_of_recent, rec_of_sid, rec_of_uid } from "../src/db.ts";
import { agenda } from "../src/query/agenda.ts";
import { query, Return } from "../src/query/query.ts"
import { recent } from "../src/query/recent.ts";
import { soc } from "../src/query/soc.ts";
import { user } from "../src/query/user.ts"

Deno.test("user", async () => {
	const u = await query({ query: "user", uid: 728 }) as Return<typeof user>
	assert(u && u.name === "万大可")
	assert(u.rec.worker === 1 && u.rec.work === 2 && u.rec.fund === 3)
	const [worker, work, fund] = await Promise.all([
		await query({ query: "rec_of_uid", coll: "worker", uid: 728 }) as Return<typeof rec_of_uid>,
		await query({ query: "rec_of_uid", coll: "work", uid: 728 }) as Return<typeof rec_of_uid>,
		await query({ query: "rec_of_uid", coll: "fund", uid: 728 }) as Return<typeof rec_of_uid>,
	])
	assert(worker.rec.length === 1 && work.rec.length === 2 && fund.rec.length === 3)
})

Deno.test("soc", async () => {
	const s = await query({ query: "soc", sid: 2 }) as Return<typeof soc>
	assert(s && s.name === "主义主义软件开发小组")
	const uname = new Map(s.uname)
	assert(uname.get(s.uid[1]) === "万大可")
	assert(s.rec.worker === 2 && s.rec.work === 4 && s.rec.fund === 3)
	const [worker, work, fund] = await Promise.all([
		await query({ query: "rec_of_sid", coll: "worker", sid: 2 }) as Return<typeof rec_of_sid>,
		await query({ query: "rec_of_sid", coll: "work", sid: 2 }) as Return<typeof rec_of_sid>,
		await query({ query: "rec_of_sid", coll: "fund", sid: 2 }) as Return<typeof rec_of_sid>,
	])
	assert(worker.rec.length === 2 && work.rec.length === 4 && fund.rec.length === 3)
})

Deno.test("agenda", async () => {
	const a = await query({ query: "agenda" }) as Return<typeof agenda>
	const a4 = a[a.length - 4]
	const a1 = a[a.length - 1]
	assert(a.length === 4 && a4._id === 4)
	assert(a1.rec.worker === 6 && a1.rec.work === 8 && a1.rec.fund === 6)
	const [worker, work, fund] = await Promise.all([
		await query({ query: "rec_of_aid", coll: "worker", aid: a1._id }) as Return<typeof rec_of_aid>,
		await query({ query: "rec_of_aid", coll: "work", aid: a1._id }) as Return<typeof rec_of_aid>,
		await query({ query: "rec_of_aid", coll: "fund", aid: a1._id }) as Return<typeof rec_of_aid>,
	])
	assert(worker.rec.length === 6 && work.rec.length === 8 && fund.rec.length === 6)
	assert(a4.dat?.typ === "imgsrc" && a4.dat.img.length === 5 && a1.dat === null)
})

Deno.test("recent", async () => {
	const r = await query({ query: "recent" }) as Return<typeof recent>
	const [worker, work, fund] = await Promise.all([
		await query({ query: "rec_of_recent", coll: "worker", utc: Date.now() }) as Return<typeof rec_of_recent>,
		await query({ query: "rec_of_recent", coll: "work", utc: Date.now() }) as Return<typeof rec_of_recent>,
		await query({ query: "rec_of_recent", coll: "fund", utc: Date.now() }) as Return<typeof rec_of_recent>,
	])
	assert(worker.rec.length === 10 && work.rec.length == 10 && fund.rec.length == r.fund)
})
