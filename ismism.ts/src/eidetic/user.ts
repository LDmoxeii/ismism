import { User } from "./dbtyp.ts"
import { coll, DocC, DocD, DocR, DocU } from "../db.ts"
import { is_nbr, not_nbr } from "../ontic/sms.ts"
import { not_adm } from "../ontic/adm.ts"
import { is_id, not_id, not_name } from "./id.ts";

async function user_c(
	nbr: NonNullable<User["nbr"]>,
	ref: User["ref"],
	adm1: string,
	adm2: string,
): DocC<User["_id"]> {
	if (not_nbr(nbr) || not_adm(adm1, adm2)) return null
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
async function user_r<
	P extends keyof User
>(
	f: { _id: User["_id"] } | { nbr: NonNullable<User["nbr"]> },
	projection: Partial<{ [K in P]: 1 }>
): DocR<Pick<User, P>> {
	if (!("_id" in f && is_id(f._id) || "nbr" in f && is_nbr(f.nbr))) return null
	return await coll.user.findOne(f, { projection }) ?? null
}
async function user_u(
	uid: User["_id"],
	u: Partial<User>,
	unset = false
): DocU {
	if (not_id(uid)) return null
	if (!unset) {
		if (u.nbr && not_nbr(u.nbr)) return null
		if (u.name && not_name(u.name)) return null
		if ((u.adm1 || u.adm2) && (!u.adm1 || !u.adm2 || not_adm(u.adm1, u.adm2))) return null
	}
	try {
		const { modifiedCount } = await coll.user.updateOne(
			{ _id: uid }, unset ? { $unset: u } : { $set: u }
		)
		return modifiedCount > 0 ? 1 : 0
	} catch { return null }
}
async function user_d(
	f: { _id: User["_id"] } | { nbr: NonNullable<User["nbr"]> },
): DocD {
	if (!("_id" in f && is_id(f._id) || "nbr" in f && is_nbr(f.nbr))) return null
	try {
		const c = await coll.user.deleteOne(f)
		return c > 0 ? 1 : 0
	} catch { return null }
}


export function user_new(
	nbr: string,
	adm1: string,
	adm2: string,
) {
	return user_c(nbr, [], adm1, adm2)
}
export function user(
	uid: number
) {
	return user_r({ _id: uid }, { name: 1, ref: 1, utc: 1, adm1: 1, adm2: 1, intro: 1 })
}
export function user_update(
	uid: number,
	u: Partial<Pick<User, "name" | "ref" | "adm1" | "adm2" | "intro" | "nbr">>,
) {
	return user_u(uid, u)
}
export function user_delete(
	uid: number
) {
	return user_d({ _id: uid })
}
