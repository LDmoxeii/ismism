import { agd_c } from "../eid/agd.ts";
import { coll } from "../eid/db.ts";
import { msg_c } from "../eid/msg.ts";
import { cdt_a, rec_c, rec_r, rec_s } from "../eid/rec.ts";
import { soc_c, soc_r } from "../eid/soc.ts";
import type { Agd, Cdt, Dbt, Ern, Lit, Soc, Usr, Wsl } from "../eid/typ.ts";
import { usr_c, usr_r } from "../eid/usr.ts";
import { Ret, is_pre } from "./can.ts";
import type { Pas } from "./pas.ts";

export type Pre = {
    pre: "usr",
    nbr: NonNullable<Usr["nbr"]>,
    adm1: Usr["adm1"],
    adm2: Usr["adm2"],
} | {
    pre: "soc",
    nam: Soc["nam"],
    adm1: Soc["adm1"],
    adm2: Soc["adm2"],
} | {
    pre: "agd",
    nam: Agd["nam"],
    soc: Agd["soc"],
} | {
    pre: "cdt",
    cdt: Cdt,
} | {
    pre: "dbt",
    dbt: Dbt,
} | {
    pre: "ern",
    ern: Ern,
} | {
    pre: "wsl",
    nam: Wsl["nam"],
} | {
    pre: "lit",
    nam: Lit["nam"],
}

export type PreRet = {
    usr: Ret<typeof usr_c>,
    soc: Ret<typeof soc_c>,
    agd: Ret<typeof agd_c>,
    cdt: Ret<typeof rec_c>,
    dbt: Ret<typeof rec_c>,
    ern: Ret<typeof rec_c>,
    wsl: Ret<typeof msg_c>,
    lit: Ret<typeof msg_c>,
}

export async function pre(
    pas: Pas,
    p: Pre,
) {
    if (!is_pre(pas, p)) return null
    switch (p.pre) {
        case "usr": return usr_c(p.nbr, p.adm1, p.adm2)
        case "soc": return soc_c(p.nam, p.adm1, p.adm2)
        case "agd": {
            const s = await soc_r(p.soc, { adm1: 1, adm2: 1 })
            return s ? agd_c(p.nam, s.adm1, s.adm2, p.soc) : null
        }
        case "cdt": {
            const { _id: { usr, soc, utc }, msg, amt, sec, utc: { eft, exp } } = p.cdt
            const [a, u] = await Promise.all([
                rec_r(coll.cdt, { usr, soc }, { eft, exp }, { _id: 1 }),
                usr_r({ _id: usr }, { _id: 1 }),
            ])
            if (a || !u) return null
            return rec_c(coll.cdt, { _id: { usr, soc, utc }, msg, amt, sec, utc: { eft, exp, agr: 0 } })
        } case "dbt": {
            const { _id: { usr, soc, utc }, msg, amt } = p.dbt
            const c = pas.cdt.find(c => c._id.soc == soc)!
            const [d] = await rec_s(coll.dbt, { usr, soc }, { frm: c.utc.eft })
            if (cdt_a(c) >= (d ? d.amt : 0) + amt) return rec_c(coll.dbt, { _id: { usr, soc, utc }, msg, amt })
            break
        } case "ern": {
            const { _id: { usr, soc, utc }, msg, amt, sec } = p.ern
            const u = await usr_r({ _id: usr }, { _id: 1 })
            if (!u) return u
            return rec_c(coll.ern, { _id: { usr, soc, utc }, msg, amt, sec })
        } case "wsl": case "lit": return msg_c(coll[p.pre], p.nam, pas.usr)
    }
    return null
}
