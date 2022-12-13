import { to_u8 } from "./base.ts"

const alg = {
	name: "HMAC",
	hash: "SHA-256",
}

export function key(
	k: string | ArrayBuffer
): Promise<CryptoKey> {
	if (typeof k === "string") k = to_u8(k)
	return crypto.subtle.importKey("raw", k, alg, false, ["sign", "verify"])
}

export function sign(
	key: CryptoKey,
	data: string,
) {
	return crypto.subtle.sign(alg.name, key, to_u8(data))
}

export function verify(
	key: CryptoKey,
	str: string,
	sig: Uint8Array,
) {
	return crypto.subtle.verify(alg.name, key, sig, to_u8(str))
}

export function digest(
	s: string
) {
	return crypto.subtle.digest(alg.hash, to_u8(s))
}
