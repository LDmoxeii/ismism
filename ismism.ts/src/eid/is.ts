import type { Act, Agd, Aut, Id, Itm, Mnu, Ord, Rec } from "./typ.ts"

export const lim_nam = 16
export const lim_intro = 2048
export const lim_msg = 256
export const lim_src = 256
export const lim_jwt = 512
export const len_code = 6
export const lim_code = 10 ** len_code

export const lst_re = 2
export const lim_re = 64

export const lim_sec = 8
export const lim_uid = 128
export const lim_res = 64

export const lim_itm = 16
export const lim_loc = 16

export const lim_gol = 8
export const lim_img = 8
export const lim_mnu = 2

export const lim_mrk = 5
export const lim_dst = 24

export const lim_md = 2048 * 8
export const lim_pin = 4

export const lim_sup = 1
export const lim_aud = 1
export const lim_aut = 7

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
export function is_intro(
	intro: Id["intro"]
) {
	return typeof intro === "string" && intro.length <= lim_intro
}
export function is_msg(
	msg: string
) {
	return typeof msg === "string" && 2 <= msg.length && msg.length <= lim_msg
}
export function is_src(
	src: string
) {
	return typeof src === "string" && src.length <= lim_src && src.startsWith("http")
}

export function is_itm(
	itm: Itm
) {
	return Object.keys(itm).length === 3 && is_nam(itm.nam) && itm.rmb >= 0 && itm.amt >= 0
}
export function is_loc(
	loc: Mnu["loc"][0]
) {
	Object.keys(loc).length === 2 && is_nam(loc.nam) && is_src(loc.src)
}
export function is_mnu(
	mnu: Mnu
) {
	return Object.keys(mnu).length === 5
		&& is_nam(mnu.nam)
		&& Object.keys(mnu.utc).length === 2 && mnu.utc.end >= mnu.utc.start
		&& Object.keys(mnu.lim).length === 3 && mnu.lim.amt >= 0 && mnu.lim.sum >= 0 && mnu.lim.week >= 0
		&& mnu.itm.every(is_itm) && mnu.loc.every(is_loc)
}
export function is_acc(
	acc: Agd["acc"]
) {
	return Object.keys(acc).length === 4 && is_src(acc.src)
		&& acc.expense <= acc.fund && acc.fund <= acc.budget
}
export function is_gol(
	gol: Agd["gol"]
) {
	return gol.length <= lim_gol && gol.every(g =>
		Object.keys(g).length === 2 && is_nam(g.nam) && is_lim(g.pct, 100)
	)
}
export function is_img(
	img: Agd["img"]
) {
	return img.length <= lim_img && img.every(m =>
		Object.keys(m).length === 2 && is_nam(m.nam) && is_src(m.src)
	)
}

export function is_recid(
	recid: Rec["_id"]
) {
	return Object.keys(recid).length === 3 && is_id(recid.uid) && is_id(recid.aid) && Number.isInteger(recid.utc)
}
export function is_rev(
	rev: NonNullable<Ord["rev"]>
) {
	return Object.keys(rev).length === 3 && is_idl(rev.uid, lim_re) && is_lim(rev.mrk, lim_mrk) && is_msg(rev.msg)
}

export function is_md(
	md: string
) {
	return typeof md === "string" && md.length <= lim_md
}

export function is_aut(
	aut: Aut["aut"],
	a?: Aut["aut"][0],
) {
	return aut.every(a => ["sup", "aud", "aut", "wsl", "lit"].includes(a))
		&& (!a || aut.includes(a))
}
export function is_actid(
	actid: Act["_id"]
) {
	return typeof actid === "string" && len_code <= actid.length && actid.length <= lim_jwt
}
