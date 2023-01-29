import { User } from "./dbtyp.ts"
import { coll, DocC, DocD, DocR, DocU, Update } from "../db.ts"
import { is_nbr, not_nbr } from "../ontic/sms.ts"
import { not_adm } from "../ontic/adm.ts"
import { is_id, not_id, not_intro, not_name } from "./id.ts"

export async function user_c(
	nbr: NonNullable<User["nbr"]>,
	ref: User["ref"],
	adm1: User["adm1"],
	adm2: User["adm2"],
): DocC<User["_id"]> {
	if (not_nbr(nbr) || ref.some(not_id) || not_adm([adm1, adm2])) return null
	const l = await coll.user.findOne({}, { projection: { _id: 1 }, sort: { _id: -1 } })
	const _id = l ? l._id + 1 : 1
	const u: User = {
		_id, nbr, ref, adm1, adm2,
		name: `${_id}`,
		utc: Date.now(),
		intro: "",
	}
	try { return await coll.user.insertOne(u) as User["_id"] }
	catch { return null }
}

export async function user_r<
	P extends keyof User
>(
	f: { _id: User["_id"] } | { nbr: NonNullable<User["nbr"]> },
	projection: Partial<{ [K in P]: 1 }>
): DocR<Pick<User, "_id" | P>> {
	if (!("_id" in f && is_id(f._id) || "nbr" in f && is_nbr(f.nbr))) return null
	return await coll.user.findOne(f, { projection }) ?? null
}

export async function user_u(
	_id: User["_id"],
	u: Update<User>,
): DocU {
	if (not_id(_id)) return null
	if ("$set" in u && u.$set) {
		if (u.$set.nbr && not_nbr(u.$set.nbr)) return null
		if (u.$set.name && not_name(u.$set.name)) return null
		if (u.$set.ref && u.$set.ref.some(not_id)) return null
		if ((u.$set.adm1 || u.adm2) && not_adm([u.$set.adm1, u.$set.adm2])) return null
		if (u.$set.intro && not_intro(u.$set.intro)) return null
	}
	try {
		const { modifiedCount } = await coll.user.updateOne({ _id }, u)
		return modifiedCount > 0 ? 1 : 0
	} catch { return null }
}

export async function user_d(
	uid: User["_id"]
): DocD {
	if (not_id(uid)) return null
	try {
		const c = await coll.user.deleteOne({ _id: uid })
		return c > 0 ? 1 : 0
	} catch { return null }
}
