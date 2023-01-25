import { coll, DocC, DocD, DocR, DocU } from "../db.ts"
import { not_adm } from "../ontic/adm.ts"
import { Soc } from "./dbtyp.ts"
import { not_id, not_intro, not_name } from "./id.ts"

export async function soc_c(
	name: Soc["name"],
	ref: Soc["_id"][],
	adm1: string,
	adm2: string,
	intro: string,
): DocC<Soc["_id"]> {
	if (not_name(name) || ref.some(not_id) || not_adm([adm1, adm2]) || not_intro(intro)) return null
	const l = await coll.soc.findOne({}, { projection: { _id: 1 }, sort: { _id: -1 } })
	const _id = l ? l._id + 1 : 1
	const s: Soc = {
		_id, name, ref, adm1, adm2, intro,
		utc: Date.now(),
		sec: [],
		uid_max: 128,
		uid: []
	}
	try { return await coll.soc.insertOne(s) as Soc["_id"] }
	catch { return null }
}

export async function soc_r<
	P extends keyof Soc
>(
	sid: Soc["_id"],
	projection: Partial<{ [K in P]: 1 }>
): DocR<Pick<Soc, "_id" | P>> {
	if (not_id(sid)) return null
	return await coll.soc.findOne({ _id: sid }, { projection }) ?? null
}

export async function soc_u(
	sid: Soc["_id"],
	s: Partial<Soc>,
): DocU {
	if (not_id(sid)) return null
	if (s.name && not_name(s.name)) return null
	if (s.ref && s.ref.some(not_id)) return null
	if ((s.adm1 || s.adm2) && not_adm([s.adm1, s.adm2])) return null
	if (s.intro && not_intro(s.intro)) return null
	if (s.sec && s.sec.some(not_id)) return null
	if (s.uid_max && s.uid_max < 0) return null
	if (s.uid && s.uid.some(not_id)) return null
	try {
		const { modifiedCount } = await coll.soc.updateOne(
			{ _id: sid }, { $set: s }
		)
		return modifiedCount > 0 ? 1 : 0
	} catch { return null }
}

export async function soc_d(
	sid: Soc["_id"]
): DocD {
	if (not_id(sid)) return null
	try {
		const c = await coll.soc.deleteOne({ _id: sid })
		return c > 0 ? 1 : 0
	} catch { return null }
}
