import type { Md } from "./typ.ts"
import type { Coll, DocC, DocD, DocR, DocU, Update } from "../db.ts"
import { is_id, is_lim, is_md, is_nam, lim_md_f, lim_md_pin } from "./is.ts"

async function md_n(
	c: Coll<Md>
): Promise<Md["_id"]> {
	const l = await c.findOne({}, { projection: { _id: 1 }, sort: { _id: -1 } })
	return l ? l._id + 1 : 1
}

export async function md_c(
	c: Coll<Md>,
	md: Pick<Md, "nam" | "uid">,
): DocC<Md["_id"]> {
	if (!is_id(md.uid) || !is_nam(md.nam)) return null
	const utc = Date.now()
	try {
		return await c.insertOne({
			_id: await md_n(c),
			nam: md.nam,
			utc: utc,
			utcp: utc,
			uid: md.uid,
			md: "",
		}) as Md["_id"]
	}
	catch { return null }
}

export async function md_r<
	P extends keyof Md,
>(
	c: Coll<Md>,
	_id: Md["_id"],
	projection?: Partial<{ [K in P]: 1 }>,
): DocR<Pick<Md, "_id" | P>> {
	if (!is_id(_id)) return null
	return await c.findOne({ _id }, { projection }) ?? null
}

export async function md_f(
	c: Coll<Md>,
	id: Md["_id"],
): DocR<Md[]> {
	const top = !is_id(id)
	const pin = await c.find({ pin: true }, {
		sort: { utcp: -1 },
		projection: top ? undefined : { _id: 1 },
	}).toArray()
	const f = {
		...top ? {} : { $lt: id },
		$nin: pin.map(p => p._id),
	}
	const md = await c.find({ _id: f }, { sort: { _id: -1 }, limit: lim_md_f }).toArray()
	return top ? [...pin, ...md] : md
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
		if (s.pin && !is_lim(await c.countDocuments({ pin: true }) + 1, lim_md_pin)) return null
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
