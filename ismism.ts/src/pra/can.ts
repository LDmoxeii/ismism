import type { Soc } from "../eid/typ.ts"
import { is_aut } from "../eid/is.ts"
import { Pas } from "./pas.ts"

// deno-lint-ignore no-explicit-any
export type Ret<T extends (...args: any) => any> = Awaited<ReturnType<T>>

function is_soc(
	sl: Soc["_id"][],
	s?: Soc["_id"],
): boolean {
	if (!s) return sl.length > 0
	return sl.includes(s)
}
export function is_cdt(
	pas: Pas,
	soc?: Soc["_id"],
): boolean {
	return is_soc(pas.cdt, soc)
}
export function is_sec(
	pas: Pas,
	soc?: Soc["_id"],
): boolean {
	return is_soc(pas.sec, soc)
}

export function is_pre_usr(
	pas: Pas
): boolean {

	return is_aut(pas.aut, pas.usr) || is_sec(pas)
}
export function is_pre_soc(
	pas: Pas
): boolean {
	return is_aut(pas.aut, pas.usr)
}
export function is_pre_agd(
	pas: Pas
): boolean {
	return is_sec(pas)
}
export function is_pre_cdt(
	pas: Pas,
	soc: Soc["_id"],
): boolean {
	return is_sec(pas, soc)
}
export function is_pre_dbt(
	pas: Pas,
	soc: Soc["_id"],
): boolean {
	return is_cdt(pas, soc)
}
export function is_pre_ern(
	pas: Pas,
	soc: Soc["_id"],
): boolean {
	return is_sec(pas, soc)
}
export function is_pre_wsl(
	pas: Pas
): boolean {
	return is_aut(pas.aut.wsl, pas.usr)
}
export function is_pre_lit(
	pas: Pas
): boolean {
	return is_aut(pas.aut.lit, pas.usr)
}

