import { assert, equal } from "https://deno.land/std@0.163.0/testing/asserts.ts"
import { keygen, keyload, sign, verify } from "../src/aut.ts"

Deno.test("aut", async () => {
	const json = { uid: 1000, name: "name", role: "admin", iat: Date.now() }
	assert("" == await sign(json))
	assert(null == await verify(""))
	await keyload()
	const token = await sign(json)
	assert(token.length > 0 && token.split(".").length == 2)
	assert(null == await verify(token.substring(1)))
	assert(equal(await verify(token), json))
	await keygen()
	assert(null == await verify(token))
	const token2 = await sign(json)
	assert(token != token2)
	assert(equal(await verify(token2), json))
})
