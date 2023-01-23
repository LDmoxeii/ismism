import { assert, assertEquals } from "https://deno.land/std@0.173.0/testing/asserts.ts"
import { from_base64, from_hex, from_u8, to_base64, to_hex, to_u8 } from "../src/ontic/base.ts"

Deno.test("base", () => {
	const t = "this is a test 1234"
	assert(t == from_u8(to_u8(t)))

	const b = new Uint8Array(255)
	b.forEach((_, n) => b[n] = Math.floor(Math.random() * 256))
	assertEquals(b.length, 255)

	assertEquals(b, from_base64(to_base64(b)))
	assertEquals(255 / 3 * 4, to_base64(b).length)

	assertEquals(b, from_hex(to_hex(b)))
	assertEquals(255 * 2, to_hex(b).length)
})
