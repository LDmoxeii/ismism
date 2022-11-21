import { assert } from "https://deno.land/std@0.163.0/testing/asserts.ts"
import { soc } from "../src/query/soc.ts";
import { user } from "../src/query/user.ts";

Deno.test("user", async () => {
	const p = await user(728)
	console.log(p)
	assert(p && p.name === "万大可")
	assert(p.work.length === 1 && p.work[0].op === "join")
	assert(new Map(p.aidname).get(p.work[0].aid as number) === "主义主义网站开发")
})

Deno.test("soc", async () => {
	const s = await soc(2)
	console.log(s)
	assert(s && s.name === "主义主义软件开发")
	const uidname = new Map(s.uidname)
	const aidname = new Map(s.aidname)
	assert(uidname.get(s.uid[1]) === "万大可")
	assert(s.work.length === 2 && s.work[1].op === "join")
	assert(aidname.get(s.work[1].aid as number) === "主义主义网站开发")
})
