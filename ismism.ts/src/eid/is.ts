import type { Act, Agd, Id, Rec, Usr, Worker } from "./typ.ts"

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

export function is_nam(
	nam?: null | Id["nam"]
) {
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
) {
	return typeof intro === "string" && intro.length <= 2048
}
export function not_intro(
	intro?: null | Id["intro"]
) {
	return !is_intro(intro)
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

export function is_rec(
	r: Rec
): r is Rec {
	return is_recid(r._id) && r.ref.every(is_id) && r.rej.every(is_id)
}
export function not_rec(
	r: Rec
) {
	return !is_rec(r)
}

export type Rol = [Usr["_id"], [Agd["_id"], Worker["rol"]][]][]

export function is_rol(
	rs: Rol[0][1],
	[aid, rol]: Rol[0][1][0],
) {
	return rs.some(([a, r]) => a === aid && r === rol)
}
export function not_rol(
	rs: Rol[0][1],
	aidrol: Rol[0][1][0],
) {
	return !is_rol(rs, aidrol)
}

export function is_actid(
	id: Act["_id"]
): id is Act["_id"] {
	return id.length >= 6
}
export function not_actid(
	id: Act["_id"]
) {
	return !is_actid(id)
}
