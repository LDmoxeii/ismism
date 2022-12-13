import * as base64 from "https://deno.land/std@0.162.0/encoding/base64url.ts"

const te = new TextEncoder()
const td = new TextDecoder()

export function to_u8(
	s: string
): Uint8Array {
	return te.encode(s)
}
export function from_u8(
	b: ArrayBuffer
): string {
	return td.decode(b)
}

export function to_base64(
	b: ArrayBuffer
): string {
	return base64.encode(b)
}
export function from_base64(
	s: string
): Uint8Array {
	return base64.decode(s)
}
