import { DocC, DocD, DocR, DocU, Proj, Updt, coll } from "./db.ts";
import { id_c, id_d, id_n, id_r, id_u } from "./id.ts";
import { is_id, is_idl, is_msg } from "./is.ts";
import type { Agd } from "./typ.ts";

export async function agd_c(
    nam: Agd["nam"],
    adm1: Agd["adm1"],
    adm2: Agd["adm2"],
    soc: Agd["soc"],
): DocC<Agd["_id"]> {
    if (!is_id(soc)) return null
    return id_c(coll.agd, {
        _id: await id_n(coll.agd),
        utc: Date.now(),
        nam, adm1, adm2, msg: "",soc
    })
}

export function agd_r<
    P extends keyof Agd
>(
    _id: Agd["_id"],
    p?: Proj<Agd, "_id" | P>,
): DocR<Pick<Agd, "_id" | P>> {
    return id_r(coll.agd, {_id}, p)
}

export async function agd_u(
    _id: Agd["_id"],
    u: Updt<Agd>,
): DocU {
    const s = u.$set
    if (u.$set && "soc" in u.$set) return null
    return await id_u(coll.agd, _id, u)
}

export function agd_d(
    _id: Agd["_id"]
): DocD {
    return id_d(coll.agd, _id)
}