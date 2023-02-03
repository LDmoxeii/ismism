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
	data: string,
	sig: Uint8Array,
) {
	return crypto.subtle.verify(alg.name, key, sig, to_u8(data))
}

export async function digest(
	data: string | ArrayBuffer,
	niter = 1
) {
	if (typeof data === "string") data = to_u8(data)
	for (let n = 0; n < niter; ++n)
		data = await crypto.subtle.digest(alg.hash, data)
	return data
}
