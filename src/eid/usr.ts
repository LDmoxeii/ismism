import { DocC, DocD, DocR, DocU, Proj, Updt, coll } from "./db.ts";
import { id_c, id_d, id_n, id_r, id_u } from "./id.ts";
import { is_jwt, is_lim, is_nbr, lim_code } from "./is.ts";
import type { Usr } from "./typ.ts";

export async function usr_c(
    nbr: NonNullable<Usr["nbr"]>,
    adm1: Usr["adm1"],
    adm2: Usr["adm2"],
): DocC<Usr["_id"]> {
    if (!is_nbr(nbr)) return null
    const _id = await id_n(coll.usr)
    return id_c(coll.usr, {
        _id,
        utc: Date.now(),
        nam: `${_id}`,
        adm1,
        adm2,
        msg: "",
        nbr,
    })
}

export async function usr_r<
    P extends keyof Usr,
>(
    f: Pick<Usr, "_id"> | Pick<Usr, "nam"> | { nbr: NonNullable<Usr["nbr"]> },
    p: Proj<Usr, "_id" | P>,
): DocR<Pick<Usr, "_id" | P>> {
    if ("nbr" in f && !is_nbr(f.nbr)) return null
    return await id_r(coll.usr, f, p)
}


export async function usr_u(
    _id: Usr["_id"],
    u: Updt<Usr>,
): DocU {
    const s = u.$set
    if (s?.nbr && !is_nbr(s.nbr)
        || s?.sms && !is_lim(s.sms.code, lim_code)
        || s?.jwt && !is_jwt(s.jwt)
    ) return null
    return await id_u(coll.usr, _id, u)
}

export function usr_d(
    _id: Usr["_id"],
): DocD {
    return id_d(coll.usr, _id)
}