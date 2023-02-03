import { assert } from "https://deno.land/std@0.173.0/testing/asserts.ts"
import { from_base64, from_u8, to_base64, to_u8 } from "./base.ts"
import { key, sign, verify } from "./crypt.ts"

type Json = Record<string, string | number | boolean>

const jwk_url = "./jwk.json"
let jwk: CryptoKey | null = null

export async function jwk_set(
	k: string
) {
	jwk = await key(k)
}
export async function jwk_load(
) {
	jwk_set(await Deno.readTextFile(jwk_url))
}

export async function jwt_sign(
	json: Json
): Promise<string> {
	assert(jwk)
	const p = to_base64(to_u8(JSON.stringify(json)))
	const s = to_base64(await sign(jwk, p))
	return `${p}.${s}`
}
export async function jwt_verify<T extends Json>(
	jwt: string
): Promise<T | null> {
	const [p, s] = jwt.split(".")
	if (!jwk || !s) return null
	const v = await verify(jwk, p, from_base64(s))
	return v ? JSON.parse(from_u8(from_base64(p))) : null
}

