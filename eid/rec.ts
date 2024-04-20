import { Coll, DocC, DocD, DocR, DocU, Fltr, Proj, coll } from './db.ts';
import { is_aug, is_id, is_rec, is_recid, is_rev, is_utc, len_rec_frm, len_rec_now, len_rec_to } from './is.ts';
import type { Cdt, Dbt, Rec } from "./typ.ts";

type FltrId = { _id: Rec["_id"] } | { usr?: Rec["_id"]["usr"], soc?: Rec["_id"]["soc"] }
type FltrUtc = Partial<{ frm: number, to: number, now: number, eft: number, exp: number }>

function fltr(
    id: FltrId,
    utc: FltrUtc,
): Fltr<Rec> | null {
    if ("_id" in id && !is_recid(id._id)
        || "usr" in id && !is_id(id.usr!)
        || "soc" in id && !is_id(id.soc!)
        || "frm" in utc && !is_utc(utc.frm!)
        || "to" in utc && !is_utc(utc.to!)
        || "now" in utc && !is_utc(utc.now!)
        || ("eft" in utc || "exp" in utc) && (!is_utc(utc.eft!) || !is_utc(utc.exp!))
    ) return null
    return {
        ..."_id" in id ? { _id: id._id } : {},
        ..."usr" in id ? { "_id.usr": id.usr } : {},
        ..."soc" in id ? { "_id.soc": id.soc } : {},
        ..."frm" in utc ? { "_id.utc": { $gte: utc.frm } } : {},
        ..."to" in utc && utc.to != 0 ? { "_id.utc": { $lt: utc.to } } : {},
        ..."now" in utc ? { "utc.eft": { $lt: utc.now }, "utc.exp": { $gt: utc.now } } : {},
        ..."eft" in utc && "exp" in utc ? { "utc.eft": { $lt: utc.exp }, "utc.exp": { $gt: utc.eft } } : {},
    }
}

export async function rec_c<
    T extends Rec,
>(
    c: Coll<T>,
    rec: T,
): DocC<T["_id"]> {
    if (!is_rec(rec)) return null
    try {
        return await c.insertOne(rec)
    } catch {
        return null
    }
}

export async function rec_r<
    T extends Rec,
    P extends keyof T,
>(
    c: Coll<T>,
    id: FltrId,
    utc: FltrUtc = {},
    projection?: Proj<T, P>,
): DocR<Pick<T, "_id" | P>> {
    const f = fltr(id, utc)
    if (!f) return null
    return await c.findOne(f, { projection }) ?? null
}

export async function rec_f<
    T extends Rec,
>(
    c: Coll<T>,
    id: FltrId,
    utc: FltrUtc,
): Promise<T[]> {
    const f = fltr(id, utc)
    if (!f) return []
    const limit = "frm" in utc ? len_rec_frm : "now" in utc ? len_rec_now : len_rec_to
    return await c.find(f, {
        sort: { "_id.utc": -1 },
        limit,
    }).toArray()
}

export async function rec_s<
    T extends Rec,
>(
    c: Coll<T>,
    id: FltrId,
    utc: FltrUtc,
): Promise<{ soc: Rec["_id"]["soc"], amt: Rec["amt"] }[]> {
    const f = fltr(id, utc)
    if (!f) return []
    const $group = {
        _id: "$_id.soc",
        amt: { $sum: "$amt" },
    }
    const $project = {
        _id: 0,
        soc: "$_id",
        amt: "$amt",
    }

    return await c.aggregate<
        { soc: Rec["_id"]["soc"], amt: Rec["amt"] }
    >([{ $match: f }, { $group }, { $project }]).toArray()
}

export async function rec_n(
    c: Coll<Rec>,
    id: FltrId,
    utc: FltrUtc,
): Promise<number> {
    const f = fltr(id, utc)
    return f ? await c.countDocuments(f) : 0
}

export async function rec_d(
    c: Coll<Rec>,
    _id: Rec["_id"],
): DocD {
    if (!is_recid(_id)) return null
    try {
        const d = await c.deleteOne({ _id })
        return d > 0 ? 1 : 0
    } catch {
        return null
    }
}

export async function cdt_u(
    _id: Cdt["_id"],
    u: {
        $set:
        {
            "utc.agr": Cdt["utc"]["agr"]
        }
    } |
    {
        $push:
        {
            aug: NonNullable<Cdt["aug"]>[0]
        }
    } |
    {
        $pop:
        {
            aug: 1
        }
    },
): DocU {
    if (
        !is_recid(_id)
        || "$set" in u && !is_utc(u.$set["utc.agr"])
        || "$push" in u && !is_aug(u.$push.aug)
    )
        return null
    try {
        const { matchedCount, modifiedCount } = await coll.cdt.updateOne({ _id }, u)
        if (matchedCount > 0) return modifiedCount > 0 ? 1 : 0
        else return null
    } catch {
        return null
    }
}

export async function dbt_u(
    _id: Dbt["_id"],
    $set: {
        sec: NonNullable<Dbt["sec"]>
    }
        | {
            rev: NonNullable<Dbt["rev"]>
        },
): DocU {
    if (
        !is_recid(_id)
        || "sec" in $set && !is_id($set.sec)
        || "rev" in $set && !is_rev($set.rev))
        return null
    try {
        const { matchedCount, modifiedCount } = await coll.dbt.updateOne({ _id }, { $set })
        if (matchedCount > 0) return modifiedCount > 0 ? 1 : 0
        else return null
    } catch {
        return null
    }
}