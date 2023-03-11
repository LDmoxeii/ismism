import type { Md } from "./typ.ts"
import type { Coll, DocC, DocD, DocR, DocU, Update } from "../db.ts"
import { is_id, is_md, is_nam, lim_md_f } from "./is.ts"

async function md_n(
	c: Coll<Md>
): Promise<Md["_id"]> {
	const l = await c.findOne({}, { projection: { _id: 1 }, sort: { _id: -1 } })
	return l ? l._id + 1 : 1
}

export async function md_c(
	c: Coll<Md>,
	md: Omit<Md, "_id" | "utc" | "utcp">,
): DocC<Md["_id"]> {
	if (!is_id(md.uid) || !is_nam(md.nam) || !is_md(md.md)) return null
	const utc = Date.now()
	try {
		return await c.insertOne({
			_id: await md_n(c),
			nam: md.nam,
			utc: utc,
			utcp: utc,
			uid: md.uid,
			md: md.md
		}) as Md["_id"]
	}
	catch { return null }
}

export async function md_r(
	c: Coll<Md>,
	_id: Md["_id"],
): DocR<Md> {
	if (!is_id(_id)) return null
	return await c.findOne({ _id }) ?? null
}

export async function md_f(
	c: Coll<Md>,
	id: Md["_id"],
): DocR<Md[]> {
	const f = is_id(id) ? { _id: { $lt: id } } : {}
	return await c.find(f, { sort: { _id: -1 }, limit: lim_md_f }).toArray() as Md[]
}

export async function md_u(
	c: Coll<Md>,
	_id: Md["_id"],
	u: Update<Md>
): DocU {
	if (!is_id(_id)) return null
	if ("$set" in u && u.$set) {
		const s = u.$set
		if (s.nam && !is_nam(s.nam)) return null
		if (s.md && !is_md(s.md)) return null
	}
	try {
		const { matchedCount, modifiedCount } = await c.updateOne({ _id }, u)
		if (matchedCount > 0) return modifiedCount > 0 ? 1 : 0
		else return null
	} catch { return null }
}

export async function md_d(
	c: Coll<Md>,
	_id: Md["_id"],
): DocD {
	if (!is_id(_id)) return null
	try {
		const d = await c.deleteOne({ _id })
		return d > 0 ? 1 : 0
	} catch { return null }
}
