import type { Rec } from "./typ.ts"
import { coll, Coll, DocC, DocD, DocR, DocU, Update } from "../db.ts"
import { is_id, is_recid, lim_rec } from "./is.ts"

export const collrec = {
	work: coll.work,
	fund: coll.fund,
}

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
	T extends Rec
>(
	c: Coll<T>,
	{ uid, aid, utc }: Partial<Rec["_id"]>,
): DocR<T[]> {
	if (uid && !is_id(uid) || aid && !is_id(aid)) return null
	const f = {
		...uid ? { "_id.uid": uid } : {},
		...aid ? { "_id.aid": aid } : {},
		...utc && utc > 0 ? { "_id.utc": { $gt: utc } } : {},
	}
	// deno-lint-ignore no-explicit-any
	return await c.find(f as any, { sort: { utc: -1 }, limit: lim_rec }).toArray() as T[]
}

export async function rec_u<
	T extends Rec
>(
	c: Coll<T>,
	_id: Rec["_id"],
	u: Update<T>,
): DocU {
	if (!is_recid(_id)) return null
	try {
		const { matchedCount, modifiedCount } = await c.updateOne({ _id }, u)
		if (matchedCount > 0) return modifiedCount > 0 ? 1 : 0
		else return null
	} catch { return null }
}

export async function rec_d<
	T extends Rec
>(
	c: Coll<T>,
	_id: Rec["_id"],
): DocD {
	if (!is_recid(_id)) return null
	try {
		const d = await c.deleteOne({ _id })
		return d > 0 ? 1 : 0
	} catch { return null }
}

export async function nrec(
	id?: { aid: Rec["_id"]["aid"] } | { uid: Rec["_id"]["uid"][] },
): DocR<{ work: number, fund: number }> {
	let p = null
	const cr = Object.values(collrec)
	if (id) {
		if ("aid" in id) {
			if (!is_id(id.aid)) return null
			p = cr.map(c => c.countDocuments({ "_id.aid": id.aid }))
		} else if ("uid" in id) {
			const uid = id.uid.filter(is_id)
			p = cr.map(c => c.countDocuments({ "_id.uid": { $in: uid } }))
		} else return null
	} else p = cr.map(c => c.estimatedDocumentCount())
	const [work, fund] = await Promise.all(p)
	return { work, fund }
}

