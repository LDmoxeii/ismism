import { coll, DocC, DocD, DocR, DocU, Update } from "../db.ts"
import { not_adm } from "../ont/adm.ts"
import { Soc, Usr } from "./typ.ts"
import { not_id, not_intro, not_nam } from "./id.ts"

export async function soc_c(
	nam: Soc["nam"],
	ref: Soc["_id"][],
	adm1: string,
	adm2: string,
	intro: string,
): DocC<Soc["_id"]> {
	if (not_nam(nam) || ref.some(not_id) || not_adm([adm1, adm2]) || not_intro(intro)) return null
	const l = await coll.soc.findOne({}, { projection: { _id: 1 }, sort: { _id: -1 } })
	const _id = l ? l._id + 1 : 1
	const s: Soc = {
		_id, nam, ref, adm1, adm2, intro,
		rej: [],
		utc: Date.now(),
		sec: [],
		uid_max: 128,
		uid: [],
		res_max: 0,
		res: [],
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
	_id: Soc["_id"],
	u: Update<Soc>,
): DocU {
	if (not_id(_id)) return null
	if ("$set" in u && u.$set) {
		const s = u.$set
		if (s.nam && not_nam(s.nam)) return null
		if (s.ref && s.ref.some(not_id)) return null
		if ((s.adm1 || s.adm2) && not_adm([s.adm1, s.adm2])) return null
		if (s.intro && not_intro(s.intro)) return null
		if (s.sec && s.sec.some(not_id)) return null
		if (s.uid_max && s.uid_max < 0) return null
		if (s.uid && s.uid.some(not_id)) return null
	}
	try {
		const { modifiedCount } = await coll.soc.updateOne({ _id }, u)
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

export async function sidnam(
	uid: Usr["_id"]
): DocR<[Soc["_id"], Soc["nam"]][]> {
	if (not_id(uid)) return []
	const s = await coll.soc.find(
		// deno-lint-ignore no-explicit-any
		{ uid } as any,
		{ projection: { _id: 1, nam: 1 } }
	).toArray()
	return s.map(s => [s._id, s.nam])
}
