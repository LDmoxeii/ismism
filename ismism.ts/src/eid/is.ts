import type { Aut, Cdt, Id, Rec, Usr } from "./typ.ts"

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
	idl: Id["_id"][],
	lim: number,
) {
	return idl.length <= lim && idl.every(is_id)
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
export function is_rec(
	rec: Rec
) {
	const { _id, msg, amt, sec } = rec
	return is_recid(_id)
		&& typeof msg == "string" && is_msg(msg, lim_msg_rec)
		&& typeof amt == "number" && amt >= 0
		&& (sec == undefined || typeof sec == "number")
}
export function is_aug(
	aug: NonNullable<Cdt["aug"]>[0]
) {
	return Object.keys(aug).length == 4 && is_msg(aug.msg, lim_msg_rec)
		&& typeof aug.amt == "number" && is_id(aug.sec) && Number.isInteger(aug.utc)
}
export function is_cdt(
	cdt: Cdt
) {
	const { utc: { eft, exp, agr }, aug } = cdt
	return is_rec(cdt) && typeof eft == "number" && typeof exp == "number" && eft <= exp && agr >= 0
		&& aug ? aug.every(is_aug) : true
}

export function is_dstid(
	dstid: Dst["_id"]
): dstid is Dst["_id"] {
	const l = Object.keys(dstid).length
	return 1 <= l && l <= 3 && is_lim(dstid.rd, lim_rd)
		&& (l === 1 || l === 2 && is_id(dstid.aid!) || l === 3 && is_id(dstid.uid!))
}

export function is_aut(
	aut: Omit<Aut, "_id"> | Usr["_id"][],
	usr: Usr["_id"],
) {
	return Array.isArray(aut)
		? aut.includes(usr)
		: Object.values(aut).some(a => a.includes(usr))
}
