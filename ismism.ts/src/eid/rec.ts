import type { Rec } from "./typ.ts"
import { Coll, DocC, DocD, DocR } from "./db.ts"
import { is_id, is_recid, lim_rec_f } from "./is.ts"

export async function rec_c<
	T extends Rec
>(
	c: Coll<T>,
	rec: T,
): DocC<T["_id"]> {
	if (!is_recid(rec._id)) return null
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

export async function rec_a<
	T extends Rec
>(
	c: Coll<T>,
	usr: Rec["_id"]["usr"],
	utc: number,
): Promise<Rec["_id"]["soc"][]> {
	const r = await c.find({
		"_id.usr": usr, "utc.eft": { $lt: utc }, "utc.exp": { $gt: utc } // deno-lint-ignore no-explicit-any
	} as any, { projection: { _id: 1 } }).toArray()
	return [...new Set(r.map(r => r._id.soc))]
}

export async function rec_s<
	T extends Rec
>(
	c: Coll<T>,
	_id: { usr: Rec["_id"]["usr"] } | { soc: Rec["_id"]["soc"] },
	utc: { eft?: number, now?: number, exp?: number },
): Promise<Rec["amt"]> {
	const $match = {
		..."usr" in _id ? { "_id.usr": _id.usr } : { "_id.soc": _id.soc },
		...utc.exp ? { "utc.exp": { $lt: utc.exp } } : {},
		...utc.now ? { "utc.eft": { $lt: utc.now }, "utc.exp": { $gt: utc.now } } : {},
		...utc.eft ? { "utc.eft": { $gt: utc.eft } } : {}, // deno-lint-ignore no-explicit-any
	} as any // deno-lint-ignore no-explicit-any
	const $group = { _id: null, amt: { $sum: "$amt" } } as any
	const [{ amt }] = await c.aggregate<{ amt: number }>([{ $match }, { $group }]).toArray()
	return amt
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
