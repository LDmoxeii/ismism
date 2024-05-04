import type { Json } from "./json.ts"
import { key, sign, verify } from "./crypt.ts"
import { frm_base64, frm_u8, to_base64, to_u8 } from "./base.ts"

const jwk_json = "./jwk.json"
let jwk = await key(`${Date.now() * Math.random()}`)

export async function jwk_set(
    k: string
) {
    jwk = await key(k)
}
export function jwk_load(
) {
    jwk_set(Deno.readTextFileSync(jwk_json))
}

export async function jwt_sign(
    json: Json
): Promise<string> {
    const p = to_base64(to_u8(JSON.stringify(json)))
    const s = to_base64(await sign(jwk, p))
    return `${p}.${s}`
}
export async function jwt_verify<
    T extends Json
>(
    jwt: string
): Promise<T | null> {
    const [p, s] = jwt.split(".")
    if (!jwk || !s) return null
    const v = await verify(jwk, p, frm_base64(s))
    return v ? JSON.parse(frm_u8(frm_base64(p))) : null
}
