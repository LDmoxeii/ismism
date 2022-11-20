import { assert } from "https://deno.land/std@0.163.0/testing/asserts.ts"
import { uname, user_profile } from "../src/query.ts"

Deno.test("user_name", async () => {
	const uid = new Array(100).fill([1, 2, 3, 728, 728, 999, 9999]).flat()
	const name = new Map(await uname(uid))
	assert(name.size === 4)
	assert(name.get(1) === "未明子")
	assert(name.get(2) === "张正午")
	assert(name.get(728) === "万大可")
	assert(name.get(999) === undefined)
})

Deno.test("user_profile", async () => {
	const p = await user_profile(728)
	console.log(p)
})
