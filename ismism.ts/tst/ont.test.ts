import { assert, assertEquals } from "./mod.ts"
import { from_base64, from_hex, from_u8, to_base64, to_hex, to_u8 } from "../src/ont/base.ts"
import { utc_day, utc_dt, utc_week } from "../src/ont/utc.ts"
import { jwk_set, jwt_sign, jwt_verify } from "../src/ont/jwt.ts"

Deno.test("base", () => {
	const t = "this is a test 1234"
	assertEquals(t, from_u8(to_u8(t)))

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
	const short = "2023-4-18 04:35"
	const utc = new Date(short).getTime()
	assertEquals(short, utc_dt(utc))
	assertEquals("2023年4月18日 04:35", utc_dt(utc, "medium"))
	assertEquals("2023-04-18", utc_dt(utc, "pad"))
	assertEquals("2023-04-17", utc_dt(utc, "padutc"))
	assertEquals("2023-4-18 00:00", utc_dt(utc_day(utc)))
	assertEquals("2023-04-17", utc_dt(utc_week(utc), "pad"))
})

Deno.test("jwt", async () => {
	const json = { uid: 1000, nam: "nam", utc: Date.now() }
	assertEquals(null, await jwt_verify(""))
	const token = await jwt_sign(json)
	assert(token.length > 0 && token.split(".").length == 2)
	assertEquals(null, await jwt_verify(token.substring(1)))
	assertEquals(await jwt_verify(token), json)
	await jwk_set("anotherkey")
	assert(null == await jwt_verify(token))
	const token2 = await jwt_sign(json)
	assert(token != token2)
	assertEquals(await jwt_verify(token2), json)
})
