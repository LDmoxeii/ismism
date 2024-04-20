import type { Coll, DocC, DocD, DocR, DocU, Updt } from "./db.ts";
import { is_id, is_lim, is_msg, is_nam, len_msg, len_msg_pin } from "./is.ts";
import type { Msg } from "./typ.ts";


export async function msg_n<
    T extends Msg,
>(
    c: Coll<T>,
): Promise<Msg["_id"]> {
    const l = await c.findOne({}, { projection: { _id: 1 }, sort: { _id: -1 } });
    return l ? l._id + 1 : 1;
}

export async function msg_c(
    c: Coll<Msg>,
    nam: Msg["nam"],
    usr: Msg["usr"],
): DocC<Msg["_id"]> {
    if (!is_nam(nam) || !is_id(usr)) return null
    const utc = Date.now()
    try {
        return c.insertOne({
            _id: await msg_n(c),
            nam,
            utc: { pre: utc, put: utc },
            usr,
            msg: "",
        })
    } catch { 
        return null
    }
}


export async function msg_r(
    c: Coll<Msg>,
    _id: Msg["_id"],
): DocR<Msg> {
    if (!is_id(_id)) return null;
    return await c.findOne({ _id }) ?? null
}

export async function msg_f(
    c: Coll<Msg>,
): Promise<Omit<Msg, "msg">[]> {
    const projection = { msg: 0 }
    const pin = await c.find({ pin: true }, {
        sort: { "utc.put": -1 },
        projection
    }).toArray()

    const msg = await c.find({ _id: { $nin: pin.map(p => p._id) } }, {
        sort: { "_id": -1 },
        projection,
    }).toArray()
    return [...pin, ...msg]
}

export async function msg_u(
    c: Coll<Msg>,
    _id: Msg["_id"],
    u: Updt<Msg>,
): DocU {
    if (!is_id(_id)) return null;
    if ("$set" in u && u.$set) {
        const s = u.$set
        if (s.nam && !is_nam(s.nam)) return null
        if (s.msg && !is_msg(s.msg, len_msg)) return null
        if (s.pin && !is_lim(await c.countDocuments({ pin: true }) + 1, len_msg_pin)) return null
    }

    try {
        const { matchedCount, modifiedCount } = await c.updateOne({ _id }, u)
        if (matchedCount > 0) return modifiedCount > 0 ? 1 : 0
        else return null
    } catch {
        return null
    }
}

export async function msg_d(
    c: Coll<Msg>,
    _id: Msg["_id"],
): DocD {
    if (!is_id(_id)) return null;
    try {
        const d = await c.deleteOne({ _id })
        return d > 0 ? 1 : 0
    } catch {
        return null
    }
}