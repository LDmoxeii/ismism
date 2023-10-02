import type { Aut, Id, Rec } from "./typ.ts"

export const lim_nam = 16
export const lim_jwt = 512
export const len_code = 6
export const lim_code = 10 ** len_code

export const lim_msg_id = 2048
export const lim_msg_rec = 256
export const lim_msg = 2048 * 8

export const lim_sec = 8

export const lim_key = 16
export const lim_pin = 4

export const lim_aut = {
	sup: 2,
	aut: 8,
	wsl: 32,
	lit: 32,
}

export const lim_rec_f = 64
export const lim_msg_f = 4
export const lim_msg_pin = 4

export function is_lim(
	n: number,
	lim: number,
) {
	return 0 <= n && n <= lim
}

export function is_id(
	id: Id["_id"]
) {
	return typeof id === "number" && id > 0
}
export function is_idl(
	id: Id["_id"][],
	lim: number,
) {
	return id.length <= lim && id.every(is_id)
}
export function is_utc(
	utc: number
) {
	return Number.isInteger(utc)
}
export function is_nam(
	nam: string
) {
	return typeof nam === "string" && /^[\u4E00-\u9FFF]{2,16}$/.test(nam)
}
export function is_nbr(
	nbr: string
) {
	return typeof nbr === "string" && /^1\d{10}$/.test(nbr)
}
export function is_jwt(
	token: string
): token is string {
	return typeof token === "string" && token.length <= lim_jwt
}
export function is_msg(
	msg: string,
	lim: number,
) {
	return typeof msg === "string" && msg.length <= lim
}

export function is_recid(
	recid: Rec["_id"]
) {
	return Object.keys(recid).length === 3 && is_id(recid.usr) && is_id(recid.soc) && Number.isInteger(recid.utc)
}

export function is_aut(
	aut: Aut["aut"],
	a?: Aut["aut"][0],
) {
	return aut.every(a => ["sup", "aut", "wsl", "lit"].includes(a))
		&& (!a || aut.includes(a))
}
