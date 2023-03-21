import type { Usr, Re, Agd, Soc, Work, Rel, Id, Md, Wsl, Lit } from "../eid/typ.ts"
import type { Pas } from "./pas.ts"
import type { UpdateRel } from "../eid/rel.ts"
import { is_aut, is_id, is_md, is_msg, is_nam, is_recid, is_url, req_re } from "../eid/is.ts"

// deno-lint-ignore no-explicit-any
export type Ret<T extends (...args: any) => any> = Awaited<ReturnType<T>>

export function is_rej(
	re: Re
): boolean {
	return re.rej.length >= req_re
}
export function is_ref(
	re: Re
): boolean {
	return re.ref.length >= req_re
}
export function is_re(
	re: Re
): boolean {
	return !is_rej(re) && is_ref(re)
}

export function is_sec(
	pas: Pas,
	sec?: { sid: Soc["_id"] } | { aid: Agd["_id"] }
): boolean {
	if (!sec) return (pas.sid.sec.length > 0 || pas.aid.sec.length > 0) && is_re(pas)
	if ("sid" in sec) return pas.sid.sec.includes(sec.sid) && is_re(pas)
	if ("aid" in sec) return pas.aid.sec.includes(sec.aid) && is_re(pas)
	return false
}
export function is_uid(
	pas: Pas,
	uid: { sid: Soc["_id"] } | { aid: Agd["_id"] }
): boolean {
	if ("sid" in uid) return pas.sid.uid.includes(uid.sid) && is_re(pas)
	if ("aid" in uid) return pas.aid.uid.includes(uid.aid) && is_re(pas)
	return false
}
export function is_res(
	pas: Pas,
	res: { sid: Soc["_id"] } | { aid: Agd["_id"] }
): boolean {
	if ("sid" in res) return pas.sid.res.includes(res.sid) && is_re(pas)
	if ("aid" in res) return pas.aid.res.includes(res.aid) && is_re(pas)
	return false
}

export function is_pre_usr(
	pas: Pas
): boolean {
	return is_aut(pas.aut) || is_sec(pas)
}
function is_pre_rel(
	pas: Pas
): boolean {
	return is_aut(pas.aut, "aut")
}
export function is_pre_soc(
	pas: Pas
): boolean {
	return is_pre_rel(pas)
}
export function is_pre_agd(
	pas: Pas
): boolean {
	return is_pre_rel(pas)
}
export function is_pre_work(
	pas: Pas,
	aid: Agd["_id"],
): boolean {
	return is_uid(pas, { aid })
}
export function is_pre_aut(
	pas: Pas
): boolean {
	return is_aut(pas.aut, "sup")
}
export function is_pre_wsl(
	pas: Pas
): boolean {
	return is_aut(pas.aut, "wsl")
}
export function is_pre_lit(
	pas: Pas
): boolean {
	return is_aut(pas.aut, "lit")
}

export function is_pro_usr(
	pas: Pas,
	re: keyof Re,
	uid: Usr["_id"],
): boolean {
	if (re !== "rej" && re !== "ref" || !is_id(uid)) return false
	return is_pre_usr(pas) && pas.uid !== uid && !pas.ref.includes(uid)
}
export function is_pro_soc(
	pas: Pas,
): boolean {
	return is_aut(pas.aut, "aud")
}
export function is_pro_agd(
	pas: Pas,
): boolean {
	return is_aut(pas.aut, "aud")
}
export function is_pro_work(
	pas: Pas,
	re: keyof Re,
	workid: Work["_id"],
): boolean {
	if (!is_recid(workid)) return false
	if (re === "rej") return is_uid(pas, { aid: workid.aid })
	if (re === "ref") return is_sec(pas, { aid: workid.aid })
	return false
}

export type PutIdRel = Pick<Id & Rel, "nam" | "adm1" | "adm2" | "uidlim"> | Pick<Id & Rel, "intro" | "reslim">
export type PutSoc = PutIdRel | UpdateRel
export type PutAgd = PutSoc
	| Pick<Agd, "intro" | "reslim" | "account" | "budget" | "fund" | "expense">
	| Pick<Agd, "goal"> | Pick<Agd, "img">
export type PutWork = { msg: string } | { nam: string, src: string }
export type PutMd = { nam: Md["nam"], md: Md["md"] } | { pin: boolean } | null
export type PutWsl = PutMd
export type PutLit = PutMd

function is_put_idrel(
	pas: Pas,
	id: { sid: Soc["_id"] } | { aid: Agd["_id"] },
	p: PutIdRel | UpdateRel | null,
): boolean {
	if (p === null || "nam" in p) return is_pre_rel(pas)
	else if ("intro" in p) return is_sec(pas, id)
	else if ("rol" in p) switch (p.rol) {
		case "sec": return is_pre_rel(pas)
		case "uid": return "uid" in p && p.uid === pas.uid && p.add === false || is_sec(pas, id)
		case "res": return "uid" in p && p.uid === pas.uid && (p.add === false || !is_rej(pas))
			|| !("uid" in p) && (is_aut(pas.aut, "aut") || is_sec(pas, id))
	}
	return false
}
export function is_put_soc(
	pas: Pas,
	sid: Soc["_id"],
	p: PutSoc | null,
): boolean {
	return is_put_idrel(pas, { sid }, p)
}
export function is_put_agd(
	pas: Pas,
	aid: Agd["_id"],
	p: PutAgd | null,
): boolean {
	if (p !== null && ("goal" in p || "img" in p)) return is_sec(pas, { aid })
	return is_put_idrel(pas, { aid }, p)
}
export function is_put_work(
	pas: Pas,
	work: Pick<Work, "_id" | "ref" | "work">,
	p: PutWork | null,
): boolean {
	return work._id.uid === pas.uid && work.ref.length === 0 && (p === null
		|| "msg" in p && is_msg(p.msg) && work.work === "work"
		|| "src" in p && is_msg(p.nam) && is_url(p.src) && work.work === "video"
	)
}
function is_put_md(
	pas: Pas,
	md: Pick<Md, "uid">,
	p: PutMd,
): boolean {
	return pas.uid === md.uid && (p === null || "nam" in p && is_nam(p.nam) && is_md(p.md) || "pin" in p)
}
export function is_put_wsl(
	pas: Pas,
	wsl: Pick<Wsl, "uid">,
	p: PutWsl,
): boolean {
	return is_put_md(pas, wsl, p) && is_pre_wsl(pas)
}
export function is_put_lit(
	pas: Pas,
	lit: Pick<Lit, "uid">,
	p: PutLit,
): boolean {
	return is_put_md(pas, lit, p) && is_pre_lit(pas)
}
