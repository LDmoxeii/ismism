import { is_id, is_lim, is_nbr, lim_code } from "../eid/is.ts";
import { Psg } from "./pas.ts";

// deno-lint-ignore no-explicit-any
export type Ret<T extends (...args: any) => any> = Awaited<ReturnType<T>>

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