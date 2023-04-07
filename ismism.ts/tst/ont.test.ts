import { assert, assertEquals, assertRejects } from "https://deno.land/std@0.178.0/testing/asserts.ts"
import { is_adm, is_adm1, is_adm2, not_adm, not_adm1, not_adm2 } from "../src/ont/adm.ts"
import { from_base64, from_hex, from_u8, to_base64, to_hex, to_u8 } from "../src/ont/base.ts"
import { digest } from "../src/ont/crypt.ts"
import { jwk_load, jwk_set, jwt_sign, jwt_verify } from "../src/ont/jwt.ts"
import { utc_date, utc_h, utc_medium, utc_short, utc_week } from "../src/ont/utc.ts"

Deno.test("base", () => {
	const t = "this is a test 1234"
	assert(t == from_u8(to_u8(t)))

	const bl = 1023
	const b = new Uint8Array(bl)
	b.forEach((_, n) => b[n] = Math.floor(Math.random() * 256))
	assertEquals(b.length, bl)

	assertEquals(b, from_base64(to_base64(b)))
	assertEquals(bl / 3 * 4, to_base64(b).length)

	assertEquals(b, from_hex(to_hex(b)))
	assertEquals(bl * 2, to_hex(b).length)
})

Deno.test("utc", () => {
	const t = Date.now()
	const [m, s, d] = [utc_medium(t), utc_short(t), utc_date(t)]
	assert(m.length > s.length && s.length > d.length && d.length > 0)
	assertEquals(utc_date(utc_week(1680833264135), true), "2023-04-03T00:00:00.000+08:00")
})

Deno.test("adm", () => {
	assert(is_adm(["四川", "成都"]) && is_adm(["广东", "汕头"]))
	assert(not_adm([undefined, null]) && not_adm(["广东", "成都"]) && not_adm(["", ""]))

	assert(is_adm1("四川") && is_adm1("广东"))
	assert(not_adm1(undefined) && not_adm1(null) && not_adm2("") && not_adm1("成都"))

	assert(is_adm2("成都") && is_adm2("汕头"))
	assert(not_adm2(undefined) && not_adm2(null) && not_adm2("") && not_adm2("四川"))
})

Deno.test("dig", async () => {
	const h = `${Math.floor(Date.now() % utc_h * Math.random())}`
	const h1000 = await digest(h, 1000)
	const h999 = await digest(h, 999)
	const h999_1 = await digest(h999)
	assertEquals(h1000, h999_1)
})

Deno.test("jwt", async () => {
	const json = { uid: 1000, nam: "nam", utc: Date.now() }
	assertRejects(() => jwt_sign(json))
	await jwk_load()
	assert(null == await jwt_verify(""))
	const token = await jwt_sign(json)
	assert(token.length > 0 && token.split(".").length == 2)
	assert(null == await jwt_verify(token.substring(1)))
	assertEquals(await jwt_verify(token), json)
	await jwk_set("anotherkey")
	assert(null == await jwt_verify(token))
	const token2 = await jwt_sign(json)
	assert(token != token2)
	assertEquals(await jwt_verify(token2), json)
})
