import type { Agd, Aut, Cdt, Dbt, Ern, Msg, Soc, Usr } from "../eid/typ.ts"
import type { Pas } from "./pas.ts"

import { agd_d, agd_u } from "../eid/agd.ts"
import { aut_u } from "../eid/aut.ts"
import { coll } from "../eid/db.ts"
import { is_lim, len_aug } from "../eid/is.ts"
import { msg_d, msg_u } from "../eid/msg.ts"
import { cdt_u, dbt_u, rec_d, rec_r, rec_s } from "../eid/rec.ts"
import { soc_d, soc_u } from "../eid/soc.ts"
import { usr_u } from "../eid/usr.ts"
import { Ret, is_put } from "./can.ts"

export type Put = {
    put: "usr",
    usr: Usr["_id"],
    nam: Usr["nam"],
    adm1: Usr["adm1"],
    adm2: Usr["adm2"],
    msg: Usr["msg"],
} | {
    put: "soc",
    soc: Soc["_id"],
    nam: Soc["nam"],
    adm1: Soc["adm1"],
    adm2: Soc["adm2"],
    sec: Soc["sec"],
} | {
    put: "soc",
    del: Soc["_id"],
} | {
    put: "soc",
    soc: Soc["_id"],
    msg: Soc["msg"],
} | {
    put: "soc",
    soc: Soc["_id"],
    agr: Soc["agr"]["msg"],
} | {
    put: "agd",
    del: Agd["_id"],
} | {
    put: "agd",
    agd: Agd["_id"],
    nam: Agd["nam"],
    adm1: Agd["adm1"],
    adm2: Agd["adm2"],
    msg: Agd["msg"],
} | {
    put: "cdt",
    del: Cdt["_id"],
} | {
    put: "cdt",
    aug: Cdt["_id"],
    msg: Cdt["msg"],
    amt: Cdt["amt"],
} | {
    put: "cdt",
    dim: Cdt["_id"],
} | {
    put: "cdt",
    agr: Cdt["_id"],
} | {
    put: "cdt",
    mov: Cdt["_id"],
    msg: Cdt["msg"],
    amt: Cdt["amt"],
} | {
    put: "cdt",
    quo: Cdt["_id"]["soc"],
    msg: Cdt["msg"],
} | {
    put: "dbt",
    del: Dbt["_id"],
} | {
    put: "dbt",
    sec: Dbt["_id"],
} | {
    put: "dbt",
    dbt: Dbt["_id"],
    rev: NonNullable<Dbt["rev"]>,
} | {
    put: "ern",
    del: Ern["_id"],
} | {
    put: "wsl" | "lit",
    id: Msg["_id"],
    nam: Msg["nam"],
    msg: Msg["msg"],
} | {
    put: "wsl" | "lit",
    id: Msg["_id"],
    pin: boolean,
} | {
    put: "wsl" | "lit",
    del: Msg["_id"],
} | {
    put: "aut",
    aut: Aut["aut"],
    wsl: Aut["wsl"],
    lit: Aut["lit"],
}

export type PutRet = {
    usr: Ret<typeof usr_u>,
    soc: Ret<typeof soc_u>,
    agd: Ret<typeof agd_u>,
    cdt: Ret<typeof cdt_u>,
}

export async function put(
    pas: Pas,
    p: Put,
) {
    if (!is_put(pas, p)) return null
    const now = Date.now()
    switch (p.put) {
        case "usr": return usr_u(p.usr, { $set: { nam: p.nam, adm1: p.adm1, adm2: p.adm2, msg: p.msg } })
        case "soc": {
            if ("nam" in p) return soc_u(p.soc, { $set: { nam: p.nam, adm1: p.adm1, adm2: p.adm2, sec: p.sec } })
            else if ("del" in p) return soc_d(p.del)
            else if ("msg" in p) return soc_u(p.soc, { $set: { msg: p.msg } })
            else if ("agr" in p) return soc_u(p.soc, { $set: { agr: { msg: p.agr, utc: p.agr.length > 0 ? now : 0 } } })
            break
        } case "agd": {
            if ("del" in p) return agd_d(p.del)
            else if ("nam" in p) return agd_u(p.agd, { $set: { nam: p.nam, adm1: p.adm1, adm2: p.adm2, msg: p.msg } })
            break
        } case "cdt": {
            if ("del" in p) return rec_d(coll.cdt, p.del)
            else if ("aug" in p) return cdt_u(p.aug, { $push: { aug: { msg: p.msg, amt: p.amt, utc: now, usr: pas.usr } } })
            else if ("dim" in p) return cdt_u(p.dim, { $pop: { aug: 1 } })
            else if ("agr" in p) return cdt_u(p.agr, { $set: { "utc.agr": now } })
            else if ("mov" in p) {
                const [frm, to] = [pas.cdt.find(c => c._id.soc == p.mov.soc), await rec_r(coll.cdt, { _id: p.mov }, { now })]
                if (!frm || !to || !is_lim(Math.max(frm.aug?.length ?? 0, to.aug?.length ?? 0), len_aug - 1)) return null
                const aug = frm.aug ? frm.aug.reduce((a, b) => a + Math.min(b.amt, 0), frm.amt) : frm.amt
                const [dbt] = await rec_s(coll.dbt, { usr: frm._id.usr, soc: frm._id.soc }, { frm: frm.utc.eft })
                if (aug >= (dbt ? dbt.amt : 0) + p.amt) {
                    const f = await cdt_u(frm._id, { $push: { aug: { msg: p.msg, amt: -p.amt, utc: now, usr: pas.usr } } })
                    if (f) return cdt_u(to._id, { $push: { aug: { msg: p.msg, amt: p.amt, utc: now, usr: pas.usr } } })
                }
            } else if ("quo" in p) {
                const c = pas.cdt.find(c => c._id.soc == p.quo)
                if (c && is_lim(c.aug?.length ?? 0, len_aug - 1))
                    return cdt_u(c._id, { $push: { aug: { msg: p.msg, amt: 0, utc: now, usr: pas.usr } } })
            }
            break
        } case "dbt": case "ern": {
            if ("del" in p) return rec_d(coll[p.put], p.del)
            else if ("sec" in p) return dbt_u(p.sec, { sec: pas.usr })
            else if ("rev" in p) return dbt_u(p.dbt, { rev: p.rev })
            break
        } case "wsl": case "lit": {
            if ("nam" in p) return msg_u(coll[p.put], p.id, { $set: { nam: p.nam, msg: p.msg, "utc.put": now } })
            else if ("pin" in p) return msg_u(coll[p.put], p.id, p.pin ? { $set: { pin: true } } : { $unset: { pin: true } })
            else if ("del" in p) return msg_d(coll[p.put], p.del)
            break
        } case "aut": return aut_u({ aut: p.aut, wsl: p.wsl, lit: p.lit })


    }
    return null
}