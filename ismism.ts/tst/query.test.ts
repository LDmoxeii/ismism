import { assert } from "https://deno.land/std@0.163.0/testing/asserts.ts"
import { coll, rec_of_aid, rec_of_sid, rec_of_uid } from "../src/db.ts"
import { agenda } from "../src/query/agenda.ts"
import { soc } from "../src/query/soc.ts"
import { user } from "../src/query/user.ts"

Deno.test("user", async () => {
	const u = await user(728)
	console.log(u)
	assert(u && u.name === "万大可")
	assert(u.rec.worker === 1 && u.rec.work === 1 && u.rec.fund === 0)
	const [worker, work, fund] = await Promise.all([
		rec_of_uid(coll.worker, [728]),
		rec_of_uid(coll.work, [728]),
		rec_of_uid(coll.fund, [728]),
	])
	assert(worker.rec.length === 1 && work.rec.length === 1 && fund.rec.length === 0)
	console.log(worker, work, fund)
})

Deno.test("soc", async () => {
	const s = await soc(2)
	console.log(s)
	assert(s && s.name === "主义主义软件开发")
	const uname = new Map(s.uname)
	assert(uname.get(s.uid[1]) === "万大可")
	assert(s.rec.worker === 2)
	assert(s.rec.work === 3)
	assert(s.rec.fund === 0)
	const [worker, work, fund] = await Promise.all([
		rec_of_sid(coll.worker, 2),
		rec_of_sid(coll.work, 2),
		rec_of_sid(coll.fund, 2),
	])
	console.log(worker, work, fund)
})

Deno.test("agenda", async () => {
	const a = await agenda()
	const a4 = a[a.length - 4]
	const a1 = a[a.length - 1]
	const [worker, work, fund] = await Promise.all([
		rec_of_aid(coll.worker, a1._id),
		rec_of_aid(coll.work, a1._id),
		rec_of_aid(coll.fund, a1._id),
	])
	console.log(a1)
	console.log(worker, work, fund)
	assert(a.length === 4 && a4._id === 4)
	assert(a4.dat?.typ === "imgsrc" && a1.dat === null)
	assert(worker.rec.length === a1.rec.worker)
	assert(work.rec.length === a1.rec.work)
	assert(fund.rec.length === a1.rec.fund)
})
