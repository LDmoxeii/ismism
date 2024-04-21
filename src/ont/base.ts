import * as base64 from "https://deno.land/std@0.178.0/encoding/base64url.ts"
import * as hex from "https://deno.land/std@0.178.0/encoding/hex.ts"

const te = new TextEncoder()
const td = new TextDecoder()

export function to_u8(
    s: string
): Uint8Array {
    return te.encode(s)
}

export function frm_u8(
    u8: ArrayBuffer
): string {
    return td.decode(u8)
}

export function to_base64(
    u8: ArrayBuffer
): string {
    return base64.encode(u8)
}

export function frm_base64(
    b64: string
 ): Uint8Array {
    return base64.decode(b64)
}

export function to_hex(
    u8: ArrayBuffer
): string {
    return frm_u8(hex.encode(new Uint8Array(u8)))
}

export function frm_hex(
    h: string
): Uint8Array {
    return hex.decode(to_u8(h))
}