import type { Soc } from "../eid/typ.ts"
import type { Pos, Pre, Put, Psg, Pas } from "./pos.ts"
import { is_aut, is_cdt, is_id, is_idl, is_lim, is_msg, is_nam, is_nbr, is_rec, is_recid, lim_aut, lim_code, lim_msg, lim_msg_id, lim_sec } from "../eid/is.ts"
import { is_adm } from "../ont/adm.ts"

// deno-lint-ignore no-explicit-any
export type Ret<T extends (...args: any) => any> = Awaited<ReturnType<T>>

export function is_in(
	sl: Soc["_id"][],
	s?: Soc["_id"],
): boolean {
	if (!s) return sl.length > 0
	return sl.includes(s)
}

export function is_psg(
	p: Psg
): boolean {
	switch (p.psg) {
		case "pas": return true
		case "sms": return is_nbr(p.nbr) && typeof p.sms == "boolean"
		case "code": return is_nbr(p.nbr) && is_lim(p.code, lim_code)
		case "clr": return is_id(p.usr)
	}
	return false
}

export function is_pre(
	pas: Pas,
	p: Pre,
): boolean {
	switch (p.pre) {
		case "usr": return (is_aut(pas.aut, pas.usr) || is_in(pas.sec))
			&& is_nbr(p.nbr)
			&& is_adm(p.adm1, p.adm2)
		case "soc": return is_aut(pas.aut, pas.usr) && is_nam(p.nam) && is_adm(p.adm1, p.adm2)
		case "agd": return is_in(pas.sec) && is_nam(p.nam) && is_id(p.soc)
		case "cdt": return is_in(pas.sec, p.cdt._id.soc)
			&& is_cdt(p.cdt) && p.cdt.sec == pas.usr
		case "dbt": return is_in(pas.cdt, p.dbt._id.soc)
			&& is_rec(p.dbt) && pas.usr == p.dbt._id.usr
		case "ern": return is_in(pas.sec, p.ern._id.soc)
			&& is_rec(p.ern) && p.ern.sec == pas.usr
		case "wsl": return is_in(pas.aut.wsl, pas.usr) && is_nam(p.nam)
		case "lit": return is_in(pas.aut.lit, pas.usr) && is_nam(p.nam)
	}
	return false
}

export function is_put(
	pas: Pas,
	p: Put,
): boolean {
	switch (p.put) {
		case "usr": return pas.usr == p.usr
			&& is_nam(p.nam) && is_adm(p.adm1, p.adm2) && is_msg(p.msg, lim_msg_id)
		case "soc":
			if ("msg" in p) return is_in(pas.sec, p.soc) && is_id(p.soc) && is_msg(p.msg, lim_msg_id)
			else if ("agr" in p) return is_in(pas.sec, p.soc) && is_id(p.soc) && is_msg(p.agr, lim_msg)
			else if ("nam" in p) return is_aut(pas.aut.aut, pas.usr)
				&& is_id(p.soc) && is_nam(p.nam) && is_adm(p.adm1, p.adm2) && is_idl(p.sec, lim_sec)
			else return is_aut(pas.aut.aut, pas.usr) && is_id(p.soc)
		case "agd":
			if ("nam" in p) return is_in(pas.agd, p.agd) && is_id(p.agd)
				&& is_nam(p.nam) && is_adm(p.adm1, p.adm2) && is_msg(p.msg, lim_msg_id)
			else return is_aut(pas.aut.aut, pas.usr) && is_id(p.agd)
		case "cdt": case "dbt": case "ern":
			if ("agr" in p) return pas.usr == p.usr && is_in(pas.cdt, p.soc)
			else return is_in(pas.sec, p.id.soc) && is_recid(p.id)
		case "wsl": case "lit":
			if (!is_in(pas.aut[p.put], pas.usr)) return false
			else if ("msg" in p) return is_id(p.id) && is_nam(p.nam) && is_msg(p.msg, lim_msg)
			else if ("pin" in p) return is_id(p.id) && typeof p.pin == "boolean"
			else return is_id(p.id)
		case "aut": return is_in(pas.aut.sup, pas.usr)
			&& is_idl(p.aut, lim_aut.aut) && is_idl(p.wsl, lim_aut.wsl) && is_idl(p.lit, lim_aut.lit)
	}
}

export function is_pos(
	pas: Pas,
	p: Pos,
): boolean {
	if ("psg" in p) return is_psg(p)
	else if ("pre" in p) return is_pre(pas, p)
	else if ("put" in p) return is_put(pas, p)
	return false
}
