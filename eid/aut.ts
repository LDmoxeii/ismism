import { DocR, DocU, coll } from './db.ts';
import { is_aug, is_aut, is_in } from './is.ts';
import { Aut, Usr } from './typ.ts';


export async function aut(
): DocR<Omit<Aut, "_id">> {
    return await coll.aut.findOne({ _id: 1 }, { projection: { _id: 0 } }) ?? null
}

export async function aut_f(
    usr: Usr["_id"],
): Promise<(keyof Omit<Aut, "_id">)[]> {
    const a = await aut()
    if (!a) return []
    const l: (keyof Omit<Aut, "_id">)[] = []
    if (is_in(a.sup, usr)) l.push("sup")
    if (is_in(a.aut, usr)) l.push("aut")
    if (is_in(a.wsl, usr)) l.push("wsl")
    if (is_in(a.lit, usr)) l.push("lit")
    return l
}

export async function aut_u(
    a: Omit<Aut, "_id">,
): DocU {
    if (!is_aut({ _id: 1, ...a })) return null
    try {
        const { matchedCount, modifiedCount } = await coll.aut.updateOne({ _id: 1 }, { $set: a })
        if (matchedCount > 0) return modifiedCount > 0 ? 1 : 0
        else return null
    } catch {
        return null
    }
}