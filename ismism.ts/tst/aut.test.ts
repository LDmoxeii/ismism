import { assert, equal } from "https://deno.land/std@0.163.0/testing/asserts.ts"
import { jwk_load, jwk_set, jwt_sign, jwt_verify } from "../src/aut.ts"

Deno.test("aut", async () => {
	const json = { uid: 1000, name: "name", role: "admin", iat: Date.now() }
	assert("" == await jwt_sign(json))
	assert(null == await jwt_verify(""))
	await jwk_load()
	const token = await jwt_sign(json)
	assert(token.length > 0 && token.split(".").length == 2)
	assert(null == await jwt_verify(token.substring(1)))
	assert(equal(await jwt_verify(token), json))
	await jwk_set("anotherkey")
	assert(null == await jwt_verify(token))
	const token2 = await jwt_sign(json)
	assert(token != token2)
	assert(equal(await jwt_verify(token2), json))
})
