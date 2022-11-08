import * as base64url from "https://deno.land/std@0.162.0/encoding/base64url.ts"

const alg = {
	name: "RSASSA-PKCS1-v1_5",
	modulusLength: 2048,
	publicExponent: new Uint8Array([1, 0, 1]),
	hash: "SHA-256",
}
const key = await crypto.subtle.generateKey(alg, true, ["sign", "verify"])
const jwk = {
	private: await crypto.subtle.exportKey("jwk", key.privateKey),
	public: await crypto.subtle.exportKey("jwk", key.publicKey)
}
const jwk_url = "./jwk"
await Deno.writeTextFile(jwk_url, JSON.stringify(jwk))
const jwk_r: typeof jwk = JSON.parse(await Deno.readTextFile(jwk_url))
const key_r = {
	private: await crypto.subtle.importKey("jwk", jwk_r.private, alg, false, ["sign"]),
	public: await crypto.subtle.importKey("jwk", jwk_r.public, alg, false, ["verify"]),
}
console.log(jwk_r)

function json_to_base64url(
	json: Record<string, string | number | boolean>
): string {
	const s = JSON.stringify(json)
	const a = base64url.encode(s)
	const b = base64url.encode(new TextEncoder().encode(s))
	console.log(`base64url-s:\n${s}`)
	console.log(`base64url-a:\n${a}`)
	console.log(`base64url-b:\n${b}`)
	return b
}

async function jwt(
): Promise<string> {
	const payload = {
		uid: 728,
		name: "728",
		role: "admin",
		iat: Date.now()
	}
	const p = json_to_base64url(payload)
	const d = new TextEncoder().encode(p)
	const sign = await crypto.subtle.sign(
		"RSASSA-PKCS1-v1_5", key_r.private,
		d
	)
	const s = base64url.encode(sign)
	const v = await crypto.subtle.verify(
		"RSASSA-PKCS1-v1_5", key_r.public,
		base64url.decode(s), d
	)
	console.log(`verified: ${v}`)
	return `${p}.${s}`
}

const t = await jwt()
console.log(`jwt: ${t}`)
