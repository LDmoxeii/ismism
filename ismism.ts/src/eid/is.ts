import type { Act, Agd, Id, Rec } from "./typ.ts"

export const req_rej = 2
export const req_ref = 2

export const lim_intro = 2048
export const lim_re = 16
export const lim_sec = 16
export const lim_res_def = 0
export const lim_res_max = 16
export const lim_uid_def = 64
export const lim_uid_max = 256
export const lim_goal = 9
export const lim_url = 256
export const lim_msg = 256

export function is_lim(
	n: number,
	lim: number,
) {
	return 0 <= n && n <= lim
}
export function not_lim(
	n: number,
	lim: number,
) {
	return !is_lim(n, lim)
}

export function is_id(
	id?: null | Id["_id"]
): id is Id["_id"] {
	return typeof id === "number" && id > 0
}
export function not_id(
	id?: null | Id["_id"]
) {
	return !is_id(id)
}

export function is_idl(
	id: Id["_id"][],
	lim: number,
) {
	return id.length <= lim && id.every(is_id)
}
export function not_idl(
	id: Id["_id"][],
	lim: number,
) {
	return !is_idl(id, lim)
}

export function is_nam(
	nam?: null | Id["nam"]
): nam is Id["nam"] {
	return typeof nam === "string" && /^[\u4E00-\u9FFF]{2,16}$/.test(nam)
}
export function not_nam(
	nam?: null | Id["nam"]
) {
	return !is_nam(nam)
}

export function is_nbr(
	nbr?: null | string
): nbr is string {
	return typeof nbr === "string" && /^1\d{10}$/.test(nbr)
}
export function not_nbr(
	nbr?: null | string
) {
	return !is_nbr(nbr)
}

export function is_intro(
	intro?: null | Id["intro"]
): intro is Id["intro"] {
	return typeof intro === "string" && intro.length <= lim_intro
}
export function not_intro(
	intro?: null | Id["intro"]
) {
	return !is_intro(intro)
}

export function not_goal(
	g: Agd["goal"][0]
) {
	return not_nam(g.nam) || typeof g.pct !== "number" || not_lim(g.pct, 100)
}
export function not_img(
	i: Agd["img"][0]
) {
	return typeof i.nam !== "string" || typeof i.src !== "string"
}

export function is_recid(
	id: Rec["_id"]
): id is Rec["_id"] {
	return Object.keys(id).length === 3 && is_id(id.uid) && is_id(id.aid) && id.utc > 0
}
export function not_recid(
	id: Rec["_id"]
) {
	return !is_recid(id)
}

export function is_actid(
	id: Act["_id"]
): id is Act["_id"] {
	return 6 <= id.length && id.length <= 64
}
export function not_actid(
	id: Act["_id"]
) {
	return !is_actid(id)
}
