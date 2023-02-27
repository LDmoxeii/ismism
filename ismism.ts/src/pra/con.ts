import { req_re } from "../eid/is.ts"
import { Usr, Re, Agd, Soc } from "../eid/typ.ts"
import { Pas } from "./pas.ts"

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
	uid: Usr["_id"],
): boolean {
	return is_pre_usr(pas) && pas.uid !== uid && !pas.ref.includes(uid)
}
export function is_pro_soc(
	pas: Pas
): boolean {
	return is_pre_soc(pas)
}
export function is_pro_agd(
	pas: Pas
): boolean {
	return is_pre_agd(pas)
}
export function is_pro_work(
	pas: Pas,
	re: "rej" | "ref",
	aid: Agd["_id"],
): boolean {
	if (re === "rej") return is_uid(pas, { aid })
	if (re === "ref") return is_sec(pas, { aid })
	return false
}
