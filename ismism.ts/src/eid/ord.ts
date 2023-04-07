import { DocC, DocD, DocR, DocU, Update, coll } from "../db.ts"
import { is_id, is_nbr, is_ordid, lim_ord_f } from "./is.ts"
import type { Ord } from "./typ.ts"

export async function ord_c(
	ord: Ord
): DocC<Ord["_id"]> {
	if (!is_ordid(ord._id)) return null
	try { return await coll.ord.insertOne(ord) as Ord["_id"] }
	catch { return null }
}

export async function ord_r(
	_id: Ord["_id"],
): DocR<Ord> {
	if (!is_ordid(_id)) return null
	return await coll.ord.findOne({ _id }) ?? null
}

export async function ord_f(
	id: Partial<Ord["_id"]> = {},
): DocR<Ord[]> {
	if (id.aid && !is_id(id.aid) || id.nbr && !is_nbr(id.nbr)) return null
	const f = {
		...id.aid ? { "_id.aid": id.aid } : {},
		...id.nbr ? { "_id.nbr": id.nbr } : {},
		...id.utc ? { "_id.utc": { $lt: id.utc } } : {},
	} // deno-lint-ignore no-explicit-any
	return await coll.ord.find(f as any, { sort: { "_id.utc": -1 }, limit: lim_ord_f }).toArray()
}

export async function nord_f(
	id: Partial<Ord["_id"]> = {},
): Promise<number> {
	if (id.aid && !is_id(id.aid) || id.nbr && !is_nbr(id.nbr)) return 0
	const f = {
		...id.aid ? { "_id.aid": id.aid } : {},
		...id.nbr ? { "_id.nbr": id.nbr } : {},
		...id.utc ? { "_id.utc": { $gt: id.utc } } : {},
	} // deno-lint-ignore no-explicit-any
	return await coll.ord.countDocuments(f as any)
}

export async function ord_u(
	_id: Ord["_id"],
	u: Update<Ord>,
): DocU {
	if (!is_ordid(_id)) return null
	try {
		const { matchedCount, modifiedCount } = await coll.ord.updateOne({ _id }, u)
		if (matchedCount > 0) return modifiedCount > 0 ? 1 : 0
		else return null
	} catch { return null }
}

export async function ord_d(
	_id: Ord["_id"],
): DocD {
	if (!is_ordid(_id)) return null
	try {
		const d = await coll.ord.deleteOne({ _id })
		return d > 0 ? 1 : 0
	} catch { return null }
}
