import type { Rec, Work } from "./typ.ts"
import { coll, Coll, DocC, DocD, DocR, DocU, Update } from "../db.ts"
import { is_id, is_idl, is_recid, lim_nrecday, lim_rec_f, lim_uid_max } from "./is.ts"
import { utc_d, utc_date } from "../ont/utc.ts"

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
	return await c.findOne({ _id }, { projection }) ?? null
}

export async function rec_f<
	T extends Rec
>(
	c: Coll<T>,
	utc: Rec["_id"]["utc"],
	id?: { aid: Rec["_id"]["aid"] } | { uid: Rec["_id"]["uid"][] },
): DocR<T[]> {
	if (id && ("aid" in id && !is_id(id.aid) || "uid" in id && !is_idl(id.uid, lim_uid_max))) return null
	const f = {
		...id && "aid" in id ? { "_id.aid": id.aid } : {},
		...id && "uid" in id ? { "_id.uid": { $in: id.uid } } : {},
		...utc > 0 ? { "_id.utc": { $lt: utc } } : {},
	} // deno-lint-ignore no-explicit-any
	return await c.find(f as any, { sort: { "_id.utc": -1 }, limit: lim_rec_f }).toArray() as T[]
}

export async function work_l(
): Promise<(Work & { work: "live" })[]> {
	const utc = Date.now()
	return await coll.work.find(
		{ work: "live", utce: { $gt: utc } },
		{ sort: { "_id.utc": -1 } },
	).toArray() as (Work & { work: "live" })[]
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

export async function nrecday<
	T extends Rec
>(
	c: Coll<T>,
	id?: { aid: Rec["_id"]["aid"] } | { uid: Rec["_id"]["uid"][] },
): Promise<[number, number][]> {
	if (id && ("aid" in id && !is_id(id.aid) || "uid" in id && !is_idl(id.uid, lim_uid_max))) return []
	const t = new Date(utc_date(Date.now() - utc_d * lim_nrecday, true)).getTime()
	const d = new Map<number, number>()
	const f = {
		...id && "aid" in id ? { "_id.aid": id.aid } : {},
		...id && "uid" in id ? { "_id.uid": { $in: id.uid } } : {},
		"_id.utc": { $gt: t },
	} // deno-lint-ignore no-explicit-any
	const r = await c.find(f as any, { projection: { _id: 0, utc: "$_id.utc" } }).toArray() as any as { utc: number }[]
	r.forEach(({ utc }) => {
		const n = t + utc_d * Math.floor((utc - t) / utc_d)
		d.set(n, (d.get(n) ?? 0) + 1)
	})
	return [...d.entries()]
}

export async function nrec(
	id?: { aid: Rec["_id"]["aid"] } | { uid: Rec["_id"]["uid"][] },
): DocR<{ work: number, fund: number }> {
	let p = null
	const cr = Object.values([coll.work, coll.fund])
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

