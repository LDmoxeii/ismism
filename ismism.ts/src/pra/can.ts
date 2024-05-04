import { is_cdt, is_id, is_idl, is_in, is_lim, is_msg, is_nam, is_nbr, is_rec, is_recid, is_rev, len_aut, len_msg, len_msg_id, len_msg_rec, len_sec, lim_amt, lim_code } from "../eid/is.ts"
import type { Soc } from "../eid/typ.ts"
import { is_adm } from "../ont/adm.ts"
import type { Pas, Psg } from "./pas.ts"
import type { Pre } from "./pre.ts"
import type { Put } from "./put.ts"


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

export function is_put(
    pas: Pas,
    p: Put,
): boolean {
    switch (p.put) {
        case "usr": return pas.usr == p.usr
            && is_nam(p.nam) && is_adm(p.adm1, p.adm2)
            && is_msg(p.msg, len_msg_id)
        case "soc": {
            if ("nam" in p) return is_aut(pas, "aut")
                && is_id(p.soc) && is_nam(p.nam) && is_adm(p.adm1, p.adm2)
                && is_idl(p.sec, len_sec)
            else if ("del" in p) return is_aut(pas, "aut") && is_id(p.del)
            else if ("msg" in p) return is_sec(pas, p.soc) && is_msg(p.msg, len_msg_id)
            else if ("agr" in p) return is_sec(pas, p.soc) && is_msg(p.agr, len_msg_id)
            break
        } case "agd": {
            if ("del" in p) return is_in(pas.agd, p.del)
            else if ("nam" in p) return is_in(pas.agd, p.agd)
                && is_nam(p.nam) && is_adm(p.adm1, p.adm2)
                && is_msg(p.msg, len_msg_id)
            break
        } case "cdt": {
            if ("del" in p) return is_sec(pas, p.del.soc) && is_recid(p.del)
            else if ("aug" in p) return is_sec(pas, p.aug.soc)
                && is_recid(p.aug) && is_msg(p.msg, len_msg_rec)
                && is_lim(p.amt, lim_amt, -lim_amt)
            else if ("dim" in p) return is_sec(pas, p.dim.soc) && is_recid(p.dim)
            else if ("agr" in p) return pas.agr! &&
                pas.agr.usr == p.agr.usr && pas.agr.soc == p.agr.soc && pas.agr.utc == p.agr.utc
            else if ("mov" in p) return pas.usr != p.mov.usr && is_usr(pas, p.mov.soc)
                && is_recid(p.mov) && is_msg(p.msg, len_msg_rec) && is_lim(p.amt, lim_amt)
            else if ("quo" in p) return is_usr(pas, p.quo) && is_msg(p.msg, len_msg_rec)
            break
        } case "dbt": {
            if ("del" in p) return is_sec(pas, p.del.soc) && is_recid(p.del)
            else if ("sec" in p) return is_sec(pas, p.sec.soc) && is_recid(p.sec)
            else if ("rev" in p) return pas.usr == p.dbt.usr && is_usr(pas, p.dbt.soc)
                && is_recid(p.dbt) && is_rev(p.rev)
            break
        } case "ern": return is_sec(pas, p.del.soc) && is_recid(p.del)
        case "wsl": case "lit": {
            if (!is_aut(pas, p.put)) return false
            if ("nam" in p) return is_id(p.id) && is_nam(p.nam) && is_msg(p.msg, len_msg)
            else if ("pin" in p) return is_id(p.id) && typeof p.pin == "boolean"
            else if ("del" in p) return is_id(p.del)
            break
        } case "aut": return is_aut(pas, "sup")
            && (["aut", "wsl", "lit"] as const).every(a => is_idl(p[a], len_aut[a]))
    }
    return false
}