import type { Cdt, Rec } from "./typ.ts"
import { Coll, DocC, DocD, DocR, DocU, coll } from "./db.ts"
import { is_id, is_msg, is_recid, lim_msg_rec, lim_rec_f } from "./is.ts"

export async function rec_c<
	T extends Rec
>(
	c: Coll<T>,
	rec: T,
): DocC<T["_id"]> {
	if (!is_recid(rec._id) || !is_msg(rec.msg, lim_msg_rec)) return null
	try { return await c.insertOne(rec) as T["_id"] }
	catch { return null }
}

export async function rec_r<
	T extends Rec,
	P extends keyof T,
>(
	c: Coll<T>,
	_id: T["_id"],
	projection?: Partial<{ [K in P]: 1 }>
): DocR<Pick<T, "_id" | P>> {
	if (!is_recid(_id)) return null
	// deno-lint-ignore no-explicit-any
	return await c.findOne({ _id } as any, { projection }) ?? null
}

export async function rec_f<
	T extends Rec
>(
	c: Coll<T>,
	id: { usr: Rec["_id"]["usr"] } | { soc: Rec["_id"]["soc"] },
	utc: Rec["_id"]["utc"],
): DocR<T[]> {
	if ("usr" in id && !is_id(id.usr) || "soc" in id && !is_id(id.soc)) return null
	const f = {
		..."usr" in id ? { "_id.usr": id.usr } : {},
		..."soc" in id ? { "_id.soc": id.soc } : {},
		...utc > 0 ? { "_id.utc": { $lt: utc } } : {},
	} // deno-lint-ignore no-explicit-any
	return await c.find(f as any, { sort: { "_id.utc": -1 }, limit: lim_rec_f }).toArray() as T[]
}

export async function cdt_u(
	_id: Cdt["_id"], agr: Cdt["utc"]["agr"],
): DocU {
	if (!is_recid(_id)) return null
	try {
		const { matchedCount, modifiedCount } = await coll.cdt
			.updateOne({ _id }, { $set: { "utc.agr": agr } })
		if (matchedCount > 0) return modifiedCount > 0 ? 1 : 0
		else return null
	} catch { return null }
}

export async function cdt_a<
	P extends keyof Cdt,
>(
	id: { usr: Cdt["_id"]["usr"] } | { soc: Cdt["_id"]["soc"] } | Omit<Cdt["_id"], "utc">,
	utc: { now: number } | { eft: number, exp: number },
	projection?: Partial<{ [K in P]: 1 }>
): Promise<Pick<Cdt, "_id" | P>[]> {
	const f = {
		..."usr" in id ? { "_id.usr": id.usr } : {},
		..."soc" in id ? { "_id.soc": id.soc } : {},
		..."now" in utc ? { "utc.eft": { $lt: utc.now }, "utc.exp": { $gt: utc.now } } : {},
		..."eft" in utc ? { "utc.eft": { $lt: utc.exp }, "utc.exp": { $gt: utc.eft } } : {},
	}
	return await coll.cdt.find(f, { projection }).toArray()
}

export function rec_s<
	T extends Rec
>(
	c: Coll<T>,
	_id: { usr: Rec["_id"]["usr"] } | { soc: Rec["_id"]["soc"] } | Omit<Rec["_id"], "utc">,
	utc: { frm?: number, eft?: number, now?: number, exp?: number },
): Promise<{ soc: Rec["_id"]["soc"], amt: number }[]> {
	const $match = {
		..."usr" in _id ? { "_id.usr": _id.usr } : {},
		..."soc" in _id ? { "_id.soc": _id.soc } : {},
		...utc.frm ? { "_id.utc": { $gte: utc.frm } } : {},
		...utc.exp ? { "utc.exp": { $lt: utc.exp } } : {},
		...utc.now ? { "utc.eft": { $lt: utc.now }, "utc.exp": { $gt: utc.now } } : {},
		...utc.eft ? { "utc.eft": { $gt: utc.eft } } : {}, // deno-lint-ignore no-explicit-any
	} as any // deno-lint-ignore no-explicit-any
	const $group = { _id: "$_id.soc", amt: { $sum: "$amt" } } as any
	const $project = { _id: 0, soc: "$_id", amt: "$amt" }
	return c.aggregate<{ soc: Rec["_id"]["soc"], amt: number }>([{ $match }, { $group }, { $project }]).toArray()
}

export async function rec_d<
	T extends Rec
>(
	c: Coll<T>,
	_id: Rec["_id"],
): DocD {
	if (!is_recid(_id)) return null
	try {
		// deno-lint-ignore no-explicit-any
		const d = await c.deleteOne({ _id } as any)
		return d > 0 ? 1 : 0
	} catch { return null }
}
