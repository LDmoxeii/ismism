import type { Usr, Re, Agd, Soc, Work, Rel, Id } from "../eid/typ.ts"
import type { Pas } from "./pas.ts"
import { is_msg, is_recid, is_url, req_re } from "../eid/is.ts"

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
	return (pas.aut || is_sec(pas)) && is_re(pas)
}
export function is_pre_soc(
	pas: Pas
): boolean {
	return pas.aut && is_re(pas)
}
export function is_pre_agd(
	pas: Pas
): boolean {
	return pas.aut && is_re(pas)
}
export function is_pre_work(
	pas: Pas,
	aid: Agd["_id"],
): boolean {
	return is_uid(pas, { aid })
}

export function is_pro_usr(
	pas: Pas,
	re: "rej" | "ref",
	uid: Usr["_id"],
): boolean {
	if (re !== "rej" && re !== "ref") return false
	return is_pre_usr(pas) && pas.uid !== uid && !pas.ref.includes(uid)
}
export function is_pro_soc(
	pas: Pas,
	re: "rej" | "ref",
): boolean {
	if (re !== "rej" && re !== "ref") return false
	return is_pre_soc(pas)
}
export function is_pro_agd(
	pas: Pas,
	re: "rej" | "ref",
): boolean {
	if (re !== "rej" && re !== "ref") return false
	return is_pre_agd(pas)
}
export function is_pro_work(
	pas: Pas,
	re: "rej" | "ref",
	workid: Work["_id"],
): boolean {
	if (!is_recid(workid)) return false
	if (re === "rej") return is_uid(pas, { aid: workid.aid })
	if (re === "ref") return is_sec(pas, { aid: workid.aid })
	return false
}

export type PutIdRel = Pick<Id & Rel, "nam" | "adm1" | "adm2" | "uidlim"> | Pick<Id & Rel, "intro" | "reslim">
// deno-lint-ignore ban-types
export type PutRel = { rel: "sec" | "uid" | "res" } & ({ add: boolean, uid: Usr["_id"] } | {})
export type PutSoc = PutIdRel | PutRel
export type PutAgd = PutSoc
	| Pick<Agd, "intro" | "reslim" | "account" | "budget" | "fund" | "expense">
	| { gnam: string, pct?: number }
	| { inam: string, src?: string }
export type PutWork = { msg: string } | { nam: string, src: string }

export function is_put_soc(
	pas: Pas,
	sid: Soc["_id"],
	p: PutSoc,
): boolean {
	if ("nam" in p) return is_pre_soc(pas)
	else if ("intro" in p) return is_sec(pas, { sid })
	else if ("rel" in p) switch (p.rel) {
		case "sec": return is_pre_soc(pas)
		case "uid": return "uid" in p && p.uid === pas.uid && p.add === false || is_sec(pas, { sid })
		case "res": return "uid" in p && p.uid === pas.uid && (p.add === false || is_re(pas))
			|| !("uid" in p) && is_sec(pas, { sid })
		default: return false
	}
	return false
}

export function is_put_agd(
	pas: Pas,
	aid: Agd["_id"],
	p: PutAgd
): boolean {
	if ("nam" in p) return is_pre_agd(pas)
	else if ("intro" in p) return is_sec(pas, { aid })
	else if ("rel" in p) switch (p.rel) {
		case "sec": return is_pre_agd(pas)
		case "uid": return "uid" in p && p.uid === pas.uid && p.add === false || is_sec(pas, { aid })
		case "res": return "uid" in p && p.uid === pas.uid && (p.add === false || is_re(pas))
			|| !("uid" in p) && is_sec(pas, { aid })
		default: return false
	}
	return false
}

export function is_put_work(
	pas: Pas,
	work: Pick<Work, "_id" | "ref" | "work">,
	p: PutWork,
): boolean {
	return work._id.uid === pas.uid && work.ref.length === 0 && (
		"msg" in p && is_msg(p.msg) && work.work === "work"
		|| "src" in p && is_msg(p.nam) && is_url(p.src) && work.work === "video"
	)
}
