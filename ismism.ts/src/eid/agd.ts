import { coll, DocC, DocD, DocR, DocU, Update } from "../db.ts"
import { not_adm } from "../ont/adm.ts"
import { not_nam, not_id, not_intro, lim_res_def, lim_uid_def, not_idl, lim_re, lim_sec, not_lim, lim_res_max, lim_uid_max, not_goal, not_img } from "./is.ts"
import { Agd } from "./typ.ts"

export async function agd_c(
	nam: Agd["nam"],
	ref: Agd["ref"][0],
	adm1: string,
	adm2: string,
): DocC<Agd["_id"]> {
	if (not_nam(nam) || not_id(ref) || not_adm([adm1, adm2])) return null
	const l = await coll.agd.findOne({}, { projection: { _id: 1 }, sort: { _id: -1 } })
	const _id = l ? l._id + 1 : 1
	const a: Agd = {
		_id, nam, rej: [], ref: [ref],
		utc: Date.now(), adm1, adm2, intro: "",
		sec: [],
		reslim: lim_res_def, res: [],
		uidlim: lim_uid_def, uid: [],
		account: "",
		budget: 0, fund: 0, expense: 0,
		goal: [], img: [],
	}
	try { return await coll.agd.insertOne(a) as Agd["_id"] }
	catch { return null }
}

export async function agd_r<
	P extends keyof Agd
>(
	aid: Agd["_id"],
	projection: Partial<{ [K in P]: 1 }>
): DocR<Pick<Agd, "_id" | P>> {
	if (not_id(aid)) return null
	return await coll.agd.findOne({ _id: aid }, { projection }) ?? null
}

export async function agd_u(
	_id: Agd["_id"],
	u: Update<Agd>,
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
		if (s.budget && s.budget < 0) return null
		if (s.fund && s.fund < 0) return null
		if (s.expense && s.expense < 0) return null
		if (s.goal && s.goal.some(not_goal)) return null
		if (s.img && s.img.some(not_img)) return null
	}
	try {
		const { modifiedCount } = await coll.agd.updateOne({ _id }, u)
		return modifiedCount > 0 ? 1 : 0
	} catch { return null }
}

export async function agd_d(
	aid: Agd["_id"]
): DocD {
	if (not_id(aid)) return null
	try {
		const c = await coll.agd.deleteOne({ _id: aid })
		return c > 0 ? 1 : 0
	} catch { return null }
}
