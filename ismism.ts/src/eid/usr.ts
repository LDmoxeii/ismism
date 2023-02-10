import { Usr } from "./typ.ts"
import { coll, DocC, DocD, DocR, DocU, Update } from "../db.ts"
import { is_nbr, not_nbr } from "../ont/sms.ts"
import { not_adm } from "../ont/adm.ts"
import { is_id, not_id, not_intro, not_nam } from "./id.ts"

export async function usr_c(
	nbr: NonNullable<Usr["nbr"]>,
	ref: Usr["ref"],
	adm1: Usr["adm1"],
	adm2: Usr["adm2"],
): DocC<Usr["_id"]> {
	if (not_nbr(nbr) || ref.some(not_id) || not_adm([adm1, adm2])) return null
	const l = await coll.usr.findOne({}, { projection: { _id: 1 }, sort: { _id: -1 } })
	const _id = l ? l._id + 1 : 1
	const u: Usr = {
		_id, nbr, ref, adm1, adm2,
		rej: [],
		nam: `${_id}`,
		utc: Date.now(),
		intro: "",
	}
	try { return await coll.usr.insertOne(u) as Usr["_id"] }
	catch { return null }
}

export async function usr_r<
	P extends keyof Usr
>(
	f: { _id: Usr["_id"] } | { nbr: NonNullable<Usr["nbr"]> },
	projection: Partial<{ [K in P]: 1 }>
): DocR<Pick<Usr, "_id" | P>> {
	if (!("_id" in f && is_id(f._id) || "nbr" in f && is_nbr(f.nbr))) return null
	return await coll.usr.findOne(f, { projection }) ?? null
}

export async function usr_u(
	_id: Usr["_id"],
	u: Update<Usr>,
): DocU {
	if (not_id(_id)) return null
	if ("$set" in u && u.$set) {
		if (u.$set.nbr && not_nbr(u.$set.nbr)) return null
		if (u.$set.nam && not_nam(u.$set.nam)) return null
		if (u.$set.ref && u.$set.ref.some(not_id)) return null
		if ((u.$set.adm1 || u.adm2) && not_adm([u.$set.adm1, u.$set.adm2])) return null
		if (u.$set.intro && not_intro(u.$set.intro)) return null
	}
	try {
		const { matchedCount, modifiedCount } = await coll.usr.updateOne({ _id }, u)
		if (matchedCount > 0) return modifiedCount > 0 ? 1 : 0
		else return null
	} catch { return null }
}

export async function usr_d(
	uid: Usr["_id"]
): DocD {
	if (not_id(uid)) return null
	try {
		const c = await coll.usr.deleteOne({ _id: uid })
		return c > 0 ? 1 : 0
	} catch { return null }
}
