import { assert } from "https://deno.land/std@0.163.0/testing/asserts.ts"
import { coll, rec_of_aid, rec_of_uid } from "../src/db.ts"
import { agenda } from "../src/query/agenda.ts"
import { soc } from "../src/query/soc.ts"
import { user } from "../src/query/user.ts"

Deno.test("user", async () => {
	const u = await user(728)
	console.log(u)
	assert(u && u.name === "万大可")
	assert(u.worker === 1 && u.work === 1 && u.fund === 0)
	const [worker, work, fund] = await Promise.all([
		rec_of_uid(coll.worker, [728]),
		rec_of_uid(coll.work, [728]),
		rec_of_uid(coll.fund, [728]),
	])
	assert(worker.length === 1 && work.length === 1 && fund.length === 0)
	console.log(worker, work, fund)
})

Deno.test("soc", async () => {
	const s = await soc(2)
	console.log(s)
	assert(s && s.name === "主义主义软件开发")
	const uname = new Map(s.uname)
	assert(uname.get(s.uid[1]) === "万大可")
	assert(s.worker === 2)
	assert(s.work === 3)
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
	assert(worker.length === a1.nworker)
	assert(work.length === a1.nwork)
	assert(fund.length === a1.nfund)
})
