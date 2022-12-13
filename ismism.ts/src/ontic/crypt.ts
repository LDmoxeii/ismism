import { to_u8 } from "./base.ts"

const alg = {
	name: "HMAC",
	hash: "SHA-256",
}

export function key(
	k: string
): Promise<CryptoKey> {
	return crypto.subtle.importKey("raw", to_u8(k), alg, false, ["sign", "verify"])
}

export function sign(
	key: CryptoKey,
	str: string,
) {
	return crypto.subtle.sign(alg.name, key, to_u8(str))
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
