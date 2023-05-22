import type { Id } from "./typ.ts"
import type { Coll, DocC, DocD, DocR, DocU, Proj, Update } from "./db.ts"
import { is_id, is_intro, is_nam, is_utc } from "./is.ts"
import { is_adm } from "../ont/adm.ts"

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
): DocC<T["_id"]> {
	const is = is_id(id._id)
		&& is_utc(id.utc)
		&& (is_nam(id.nam) || id.nam === `${id._id}`)
		&& is_adm(id.adm1, id.adm2)
		&& is_intro(id.intro)
	if (!is) return null
	try { return await c.insertOne(id) as T["_id"] } catch { return null }
}

export async function id_r<
	T extends Id,
	P extends keyof T,
>(
	c: Coll<T>,
	f: Partial<T>,
	p: Proj<T, P>,
): DocR<Pick<T, "_id" | P>> {
	if (f._id && !is_id(f._id) || f.nam && !is_nam(f.nam)) return null
	return await c.findOne(f, { projection: p }) ?? null
}

export async function id_u<
	T extends Id
>(
	c: Coll<T>,
	_id: T["_id"],
	u: Update<T>,
): DocU {
	if (!is_id(_id)) return null
	const s = u.$set
	if (s) {
		if (s.nam && !is_nam(s.nam)) return null
		if ((s.adm1 || s.adm2) && !((s.adm1 && s.adm2) && is_adm(s.adm1, s.adm2))) return null
		if (s.intro && !is_intro(s.intro)) return null
	}
	try { // deno-lint-ignore no-explicit-any
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
	try { // deno-lint-ignore no-explicit-any
		const d = await c.deleteOne({ _id } as any)
		return d > 0 ? 1 : 0
	} catch { return null }
}
