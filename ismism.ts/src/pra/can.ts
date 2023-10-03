import type { Soc } from "../eid/typ.ts"
import type { Pas } from "./pas.ts"
import type { Pre } from "./pre.ts"
import { is_aut, is_cdt, is_id, is_nam, is_nbr, is_rec } from "../eid/is.ts"
import { is_adm } from "../ont/adm.ts"

// deno-lint-ignore no-explicit-any
export type Ret<T extends (...args: any) => any> = Awaited<ReturnType<T>>

function is_in(
	sl: Soc["_id"][],
	s?: Soc["_id"],
): boolean {
	if (!s) return sl.length > 0
	return sl.includes(s)
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
