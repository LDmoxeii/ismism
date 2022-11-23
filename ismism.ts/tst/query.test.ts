import { assert } from "https://deno.land/std@0.163.0/testing/asserts.ts"
import { agenda } from "../src/query/agenda.ts"
import { fund_of_aid } from "../src/query/fund.ts"
import { soc } from "../src/query/soc.ts"
import { user } from "../src/query/user.ts"
import { work_of_aid } from "../src/query/work.ts"
import { worker_of_aid } from "../src/query/worker.ts"

Deno.test("user", async () => {
	const p = await user(728)
	console.log(p)
	assert(p && p.name === "万大可")
	assert(p.work.length === 1 && p.work[0].op === "work")
	assert(new Map(p.aname).get(p.work[0]._id.aid) === "主义主义网站开发")
})

Deno.test("soc", async () => {
	const s = await soc(2)
	console.log(s)
	assert(s && s.name === "主义主义软件开发")
	const uname = new Map(s.uname)
	const aname = new Map(s.aname)
	assert(uname.get(s.uid[1]) === "万大可")
	assert(s.worker.length === 2 && s.worker[1].role === "程序员")
	assert(s.work.length === 3 && s.work[1].op === "work")
	assert(aname.get(s.work[1]._id.aid) === "主义主义网站开发")
})

Deno.test("agenda", async () => {
	const a = await agenda()
	const a4 = a[a.length - 4]
	const a1 = a[a.length - 1]
	const [worker, work, fund] = await Promise.all([
		worker_of_aid(a1._id),
		work_of_aid(a1._id),
		fund_of_aid(a1._id),
	])
	console.log(a1)
	console.log(worker, work, fund)
	assert(a.length === 4 && a4._id === 4)
	assert(a4.dat?.typ === "imgsrc" && a1.dat === null)
	assert(worker.length === a1.nworker)
	assert(work.length === a1.nwork)
	assert(fund.length === a1.nfund)
})
