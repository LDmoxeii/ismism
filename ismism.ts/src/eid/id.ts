import { is_adm } from "../ont/adm.ts";
import { Coll, DocC, DocD, DocR, DocU, Fltr, Proj, Updt, coll } from "./db.ts";
import { is_id, is_msg, is_nam, is_utc, len_msg_id } from "./is.ts";
import type { Id } from "./typ.ts";

export async function id_n<
    T extends Id,
>(
    c: Coll<T>,
): Promise<T["_id"]> {
    const l = await c.findOne({}, { projection: { _id: 1 }, sort: { _id: -1 } })
    return l ? l._id + 1 : 1
}

export async function id_c<
    T extends Id,
>(
    c: Coll<T>,
    id: T,
): DocC<T["_id"]> {
    const is =
        is_id(id._id) &&
        is_utc(id.utc) &&
        (is_nam(id.nam) || id.nam == `${id._id}`) &&
        is_adm(id.adm1, id.adm2) &&
        is_msg(id.msg, len_msg_id)
    if (!is) return null
    try {
        return await c.insertOne(id)
    } catch { return null }
}

export async function id_r<
    T extends Id,
    P extends keyof T,
>(
    c: Coll<T>,
    f: Partial<T>,
    projection?: Proj<T, P>,
): DocR<Pick<T, "_id" | P>> {
    if (f._id && !is_id(f._id) || f.nam && !is_nam(f.nam)) return null
    return await c.findOne(f as Fltr<T>, { projection }) ?? null
}
export async function id_u<
    T extends Id,
>(
    c: Coll<T>,
    _id: T["_id"],
    u: Updt<T>,
): DocU {
    if (!is_id(_id)) return null
    const s = u.$set
    if (s) {
        if (s.nam && !is_nam(s.nam)) return null
        if ((s.adm1 || s.adm2) && !((s.adm1 && s.adm2) && is_adm(s.adm1, s.adm2))) {
            return null
        }
        if (s.msg && !is_msg(s.msg, len_msg_id)) return null
    }
    try {
        const { matchedCount, modifiedCount } = await c.updateOne(
            // deno-lint-ignore no-explicit-any
            { _id } as any,
            u,
        )
        if (matchedCount > 0) return modifiedCount > 0 ? 1 : 0
        else return null
    } catch { return null }
}

export async function id_d<
    T extends Id,
>(
    c: Coll<T>,
    _id: T["_id"],
): DocD {
    if (!is_id(_id)) return null
    try {
        // deno-lint-ignore no-explicit-any
        const d = await c.deleteOne({ _id } as any)
        return d > 0 ? 1 : 0
    } catch { return null }
}

export async function id<
    T extends Id,
>(
    c: Coll<T>,
    f: Fltr<T>,
): Promise<T["_id"][]> {
    const d = await c.find(f, { projection: { _id: 1 } }).toArray()
    return d.map(d => d._id)
}

export async function idnam<
    T extends Id
>(
    c: Coll<T>,
    id: T["_id"][],
): Promise<[T["_id"], T["nam"]][]> {
    id = [...new Set(id)]
    const d = await c.find(
        // deno-lint-ignore no-explicit-any
        { _id: { $in: id } } as any,
        { projection: { _id: 1, nam: 1 } }
    ).toArray()
    return d.map(d => [d._id, d.nam])
}

export async function idadm<
    A extends "adm1" | "adm2"
>(
    adm: A
): Promise<[Id[A], Id["_id"][]][]> {
    const d = await coll.soc.aggregate<{
        _id: Id[A], soc: Id["_id"][]
    }>([{ $group: { _id: `$${adm}`, soc: { $push: "$_id" } } }]).toArray()
    return d.sort((a, b) => b.soc.length - a.soc.length).map(d => [d._id, d.soc.sort()])
}