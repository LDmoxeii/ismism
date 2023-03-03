import type { Coll, DocC, DocD, DocR, DocU, Update } from "../db.ts"
import type { Id, Re, Usr } from "./typ.ts"
import { is_adm, is_adm1, is_adm2 } from "../ont/adm.ts"
import { is_id, is_idl, is_intro, is_nam, lim_re } from "./is.ts"

export async function id_n<
	T extends Id
>(
	c: Coll<T>
): Promise<T["_id"]> {
	const l = await c.findOne({}, { projection: { _id: 1 }, sort: { _id: -1 } })
	return l ? l._id + 1 : 1
}

export async function id_c<
	T extends Id
>(
	c: Coll<T>,
	id: T,
	isnam = false,
): DocC<T["_id"]> {
	const is = is_id(id._id)
		&& (isnam || is_nam(id.nam))
		&& is_adm([id.adm1, id.adm2])
		&& is_intro(id.intro)
		&& is_idl(id.rej, lim_re)
		&& is_idl(id.ref, lim_re)
	if (!is) return null
	try { return await c.insertOne(id) as T["_id"] }
	catch { return null }
}

export async function id_r<
	T extends Id,
	P extends keyof T,
>(
	c: Coll<T>,
	f: Partial<T>,
	projection: Partial<{ [K in P]: 1 }>
): DocR<Pick<T, "_id" | P>> {
	if (f._id && !is_id(f._id) || f.nam && !is_nam(f.nam)) return null
	return await c.findOne(f, { projection }) ?? null
}

export async function id_u<
	T extends Id
>(
	c: Coll<T>,
	_id: T["_id"],
	u: Update<T>,
): DocU {
	if (!is_id(_id)) return null
	if ("$set" in u && u.$set) {
		const s = u.$set
		if (s.nam && !is_nam(s.nam)) return null
		if ((s.adm1 || u.adm2) && !is_adm([s.adm1, s.adm2])) return null
		if (s.intro && !is_intro(s.intro)) return null
		if (s.rej && !is_idl(s.rej, lim_re)) return null
		if (s.ref && !is_idl(s.ref, lim_re)) return null
	}
	try {
		// deno-lint-ignore no-explicit-any
		const { matchedCount, modifiedCount } = await c.updateOne({ _id } as any, u)
		if (matchedCount > 0) return modifiedCount > 0 ? 1 : 0
		else return null
	} catch { return null }
}

export async function id_d<
	T extends Id
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

export async function idnam<
	T extends Id
>(
	c: Coll<T>,
	id: T["_id"][],
): Promise<[T["_id"], T["nam"]][]> {
	id = [...new Set(id.filter(is_id))]
	const d = await c.find(
		// deno-lint-ignore no-explicit-any
		{ _id: { $in: id } } as any,
		{ projection: { _id: 1, nam: 1 } }
	).toArray()
	return d.map(d => [d._id, d.nam])
}

export async function id<
	T extends Id,
>(
	c: Coll<T>,
	f?: { adm1: string } | { adm2: string } | Partial<{ [R in keyof Re]: Usr["_id"] }>,
): Promise<Id["_id"][]> {
	if (f && ("adm1" in f && !is_adm1(f.adm1)
		|| "adm2" in f && !is_adm2(f.adm2)
		|| "rej" in f && !is_id(f.rej!)
		|| "ref" in f && !is_id(f.ref!)
	)) return []
	// deno-lint-ignore no-explicit-any
	const d = await c.find(f as any, { projection: { _id: 1 }, sort: { _id: -1 } }).toArray()
	return d.map(d => d._id)
}

export async function nid<
	T extends Id
>(
	c: Coll<T>,
	f?: Partial<{ [R in keyof Re]: Usr["_id"] }>,
): Promise<number> {
	if (f && ("rej" in f && !is_id(f.rej!) || "ref" in f && !is_id(f.ref!))) return 0
	// deno-lint-ignore no-explicit-any
	return f ? await c.countDocuments(f as any) : c.estimatedDocumentCount()
}

export async function nid_of_adm<
	T extends Id,
	A extends "adm1" | "adm2",
>(
	c: Coll<T>,
	a: A,
): Promise<[T[A], number][]> {
	const d = await c.aggregate<{
		_id: T[A], nid: number
	}>([{
		$group: { _id: `$${a}`, nid: { $count: {} } },
	}, {
		$sort: { nid: -1 },
	}]).toArray()
	return d.map(d => [d._id, d.nid])
}
