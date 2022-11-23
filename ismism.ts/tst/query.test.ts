import { assert } from "https://deno.land/std@0.163.0/testing/asserts.ts"
import { soc } from "../src/query/soc.ts"
import { user } from "../src/query/user.ts"

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
