import { Act, Agd, Id, Rec, Usr } from "./typ.ts";

export const req_re = 2
export const lim_re = 64

export const lim_sec = 16
export const lim_uid_def = 64
export const lim_uid_max = 256
export const lim_res_def = 0
export const lim_res_max = 64

export const lim_intro = 2048
export const lim_goal = 9
export const lim_url = 128
export const lim_msg = 256

export function is_lim(
	n: number,
	lim: number,
) {
	return 0 <= n && n <= lim
}

export function is_id(
	id: Id["_id"]
): id is Id["_id"] {
	return typeof id === "number" && id > 0
}
export function is_idl(
	id: Id["_id"][],
	lim: number,
): id is Id["_id"][] {
	return id.length <= lim && id.every(is_id)
}

export function is_nam(
	nam: string
): nam is Id["nam"] {
	return typeof nam === "string" && /^[\u4E00-\u9FFF]{2,16}$/.test(nam)
}

export function is_nbr(
	nbr: NonNullable<Usr["nbr"]>
): nbr is NonNullable<Usr["nbr"]> {
	return typeof nbr === "string" && /^1\d{10}$/.test(nbr)
}

export function is_intro(
	intro: Id["intro"]
): intro is Id["intro"] {
	return typeof intro === "string" && intro.length <= lim_intro
}

export function is_goal(
	goal: Agd["goal"][0]
): goal is Agd["goal"][0] {
	return is_nam(goal.nam) && is_lim(goal.pct, 100)
}

export function is_url(
	url: string
): url is string {
	return typeof url === "string" && url.length <= lim_url
}
export function is_msg(
	msg: string
): msg is string {
	return typeof msg === "string" && msg.length <= lim_msg
}

export function is_img(
	img: Agd["img"][0]
): img is Agd["img"][0] {
	return is_msg(img.nam) && is_url(img.src)
}

export function is_recid(
	recid: Rec["_id"]
): recid is Rec["_id"] {
	return is_id(recid.uid) && is_id(recid.aid) && recid.utc > 0
}

export function is_actid(
	actid: Act["_id"]
): actid is Act["_id"] {
	return typeof actid === "string" && 6 <= actid.length && actid.length <= lim_url
}
