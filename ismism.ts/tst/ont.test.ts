import { assertEquals } from "./mod.test.ts"
import { from_base64, from_hex, from_u8, to_base64, to_hex, to_u8 } from "../src/ont/base.ts"

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
