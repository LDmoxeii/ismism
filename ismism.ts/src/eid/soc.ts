import { coll, DocC, DocD, DocR, DocU, Update } from "../db.ts"
import { not_adm } from "../ont/adm.ts"
import { Soc } from "./typ.ts"
import { not_nam, not_id, not_intro, lim_res_def, lim_uid_def, not_idl, lim_re, lim_sec, lim_res_max, lim_uid_max, not_lim } from "./is.ts"

export async function soc_c(
	nam: Soc["nam"],
	ref: Soc["ref"][0],
	adm1: string,
	adm2: string,
): DocC<Soc["_id"]> {
	if (not_nam(nam) || not_id(ref) || not_adm([adm1, adm2])) return null
	const l = await coll.soc.findOne({}, { projection: { _id: 1 }, sort: { _id: -1 } })
	const _id = l ? l._id + 1 : 1
	const s: Soc = {
		_id, nam, rej: [], ref: [ref],
		utc: Date.now(), adm1, adm2, intro: "",
		sec: [],
		reslim: lim_res_def, res: [],
		uidlim: lim_uid_def, uid: [],
	}
	try { return await coll.soc.insertOne(s) as Soc["_id"] }
	catch { return null }
}

export async function soc_r<
	P extends keyof Soc
>(
	sid: Soc["_id"],
	projection: Partial<{ [K in P]: 1 }>,
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
		if (s.rej && not_idl(s.rej, lim_re) || s.ref && not_idl(s.ref, lim_re)) return null
		if ((s.adm1 || s.adm2) && not_adm([s.adm1, s.adm2])) return null
		if (s.intro && not_intro(s.intro)) return null
		if (s.sec && not_idl(s.sec, lim_sec)) return null
		if (s.reslim && not_lim(s.reslim, lim_res_max)) return null
		if (s.uidlim && not_lim(s.uidlim, lim_uid_max)) return null
		if (s.uid && not_idl(s.uid, s.uidlim ?? lim_uid_max)) return null
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
