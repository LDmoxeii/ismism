import type { Json } from "./json.ts"
import { from_base64, from_u8, to_base64, to_u8 } from "./base.ts"
import { key, sign, verify } from "./crypt.ts"

const jwk_url = "./jwk.json"
let jwk = await key(`${Date.now() * Math.random()}`)

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

