import { assert } from "https://deno.land/std@0.163.0/testing/asserts.ts"
import { user_profile } from "../src/query/user.ts";

Deno.test("user_profile", async () => {
	const p = await user_profile(728)
	console.log(p)
	assert(p && p.name === "万大可")
	assert(p.work.length === 1 && p.work[0].op === "join")
	assert(new Map(p.aidname).get(p.work[0].aid as number) === "主义主义网站开发")
})
