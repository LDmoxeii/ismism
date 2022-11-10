import * as base64url from "https://deno.land/std@0.162.0/encoding/base64url.ts"

const alg = {
	name: "RSASSA-PKCS1-v1_5",
	modulusLength: 2048,
	publicExponent: new Uint8Array([1, 0, 1]),
	hash: "SHA-256",
}

type Key<T extends CryptoKey | JsonWebKey> = {
	private: T,
	public: T
}
type Json = Record<string, string | number | boolean>

const jwk_url = "./jwk.json"
let key: Key<CryptoKey> | null = null

export async function keygen(
	file = false
) {
	const p = await crypto.subtle.generateKey(alg, true, ["sign", "verify"])
	key = { private: p.privateKey, public: p.publicKey }
	if (file) {
		const jwk: Key<JsonWebKey> = {
			private: await crypto.subtle.exportKey("jwk", key.private),
			public: await crypto.subtle.exportKey("jwk", key.public)
		}
		await Deno.writeTextFile(jwk_url, JSON.stringify(jwk))
	}
}
export async function keyload(
) {
	const jwk = JSON.parse(await Deno.readTextFile(jwk_url)) as Key<JsonWebKey>
	key = {
		private: await crypto.subtle.importKey("jwk", jwk.private, alg, false, ["sign"]),
		public: await crypto.subtle.importKey("jwk", jwk.public, alg, false, ["verify"]),
	}
}

export async function sign(
	json: Json
): Promise<string> {
	if (!key) return ""
	const p = base64url.encode(JSON.stringify(json))
	const s = await crypto.subtle.sign(
		alg.name, key.private,
		new TextEncoder().encode(p)
	)
	return `${p}.${base64url.encode(s)}`
}
export async function verify(
	token: string
): Promise<Json | null> {
	const [p, s] = token.split(".")
	if (!key || !s) return null
	const v = await crypto.subtle.verify(
		alg.name, key.public,
		base64url.decode(s), new TextEncoder().encode(p)
	)
	return v ? JSON.parse(new TextDecoder().decode(base64url.decode(p))) : null
}
