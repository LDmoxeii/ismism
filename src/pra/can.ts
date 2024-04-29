import type { Pas, Psg } from "./pas.ts"
import type { Soc } from "../eid/typ.ts"
import type { Pre } from "./pre.ts"
import { is_cdt, is_id, is_in, is_lim, is_nam, is_nbr, is_rec, lim_code } from "../eid/is.ts"
import { is_adm } from "../ont/adm.ts"


// deno-lint-ignore no-explicit-any
export type Ret<T extends (...args: any) => any> = Awaited<ReturnType<T>>

export function is_aut(
    pas: Pas,
    aut?: Pas["aut"][0],
): boolean {
    return aut ? pas.aut.includes(aut) : pas.aut.length > 0
}
export function is_sec(
    pas: Pas,
    soc?: Soc["_id"],
): boolean {
    return soc ? is_in(pas.sec, soc) : pas.sec.length > 0
}
export function is_usr(
    pas: Pas,
    soc?: Soc["_id"],
): boolean {
    return soc ? pas.cdt.some(c => c._id.soc == soc) : pas.cdt.length > 0
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
        case "usr": return (is_aut(pas) || is_sec(pas)) && is_nbr(p.nbr) && is_adm(p.adm1, p.adm2)
        case "soc": return is_aut(pas, "aut") && is_nam(p.nam) && is_adm(p.adm1, p.adm2)
        case "agd": return is_sec(pas, p.soc) && is_nam(p.nam)
        case "cdt": return is_sec(pas, p.cdt._id.soc) && is_cdt(p.cdt) && p.cdt.sec == pas.usr
        case "dbt": return is_usr(pas, p.dbt._id.soc) && p.dbt._id.usr == pas.usr && is_rec(p.dbt)
        case "ern": return is_sec(pas, p.ern._id.soc) && is_rec(p.ern) && p.ern.sec == pas.usr
        case "wsl": case "lit": return is_aut(pas, p.pre) && is_nam(p.nam)
    }
    return false
}
