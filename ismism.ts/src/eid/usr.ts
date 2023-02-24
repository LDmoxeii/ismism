import { coll, DocC, DocD, DocR, DocU, Update } from "../db.ts"
import { is_adm } from "../ont/adm.ts"
import { id_c, id_d, id_n, id_r, id_u } from "./id.ts"
import { is_nbr } from "./is.ts"
import { Usr } from "./typ.ts"

export async function usr_c(
	nbr: NonNullable<Usr["nbr"]>,
	adm1: Usr["adm1"],
	adm2: Usr["adm2"],
): DocC<Usr["_id"]> {
	if (!is_nbr(nbr) || !is_adm([adm1, adm2])) return null
	const _id = await id_n(coll.usr)
	return id_c(coll.usr, {
		_id, nam: `${_id}`, nbr,
		utc: Date.now(), adm1, adm2,
		intro: "",
		rej: [], ref: [],
	}, true)
}

export async function usr_r<
	P extends keyof Usr
>(
	f: { _id: Usr["_id"] } | { nam: Usr["nam"] } | { nbr: NonNullable<Usr["nbr"]> },
	projection: Partial<{ [K in P]: 1 }>
): DocR<Pick<Usr, "_id" | P>> {
	if ("nbr" in f && !is_nbr(f.nbr)) return null
	return await id_r(coll.usr, f, projection)
}

export async function usr_u(
	uid: Usr["_id"],
	u: Update<Usr>,
): DocU {
	if ("$set" in u && u.$set && u.$set.nbr && !is_nbr(u.$set.nbr)) return null
	return await id_u(coll.usr, uid, u)
}

export function usr_d(
	uid: Usr["_id"]
): DocD {
	return id_d(coll.usr, uid)
}
