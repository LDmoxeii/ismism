import { DocC, DocD, DocR, DocU, Proj, Updt, coll } from "./db.ts";
import { id_c, id_d, id_n, id_r, id_u } from "./id.ts";
import { is_idl, is_msg, is_utc, len_msg_agr, len_sec } from "./is.ts";
import type { Soc } from "./typ.ts";

export async function soc_c(
    nam: Soc["nam"],
    adm1: Soc["adm1"],
    adm2: Soc["adm2"],
): DocC<Soc["_id"]> {
    return id_c(coll.soc, {
        _id: await id_n(coll.soc),
        utc: Date.now(),
        nam, adm1, adm2, msg: "",
        sec: [], agr: { msg: "", utc: 0 },
    })
}

export function soc_r<
    P extends keyof Soc
>(
    _id: Soc["_id"],
    p?: Proj<Soc, "_id" | P>,
): DocR<Pick<Soc, "_id" | P>> {
    return id_r(coll.soc, { _id }, p)
}

export async function soc_u(
    _id: Soc["_id"],
    u: Updt<Soc>,
): DocU {
    const s = u.$set
    if (s?.sec && !is_idl(s.sec, len_sec) || s?.agr
        && (!is_msg(s.agr.msg, len_msg_agr) || !is_utc(s.agr.utc))
    ) return null
    return await id_u(coll.soc, _id, u)
}

export function soc_d(
    _id: Soc["_id"]
): DocD {
    return id_d(coll.soc, _id)
}