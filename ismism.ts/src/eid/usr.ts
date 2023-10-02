import type { Usr } from "./typ.ts"
import { DocC, DocD, DocR, DocU, Proj, Updt, coll } from "./db.ts"
import { is_lim, is_nbr, lim_code, lim_jwt } from "./is.ts"
import { id_c, id_d, id_n, id_r, id_u } from "./id.ts"

export async function usr_c(
	nbr: NonNullable<Usr["nbr"]>,
	adm1: Usr["adm1"],
	adm2: Usr["adm2"],
): DocC<Usr["_id"]> {
	if (!is_nbr(nbr)) return null
	const _id = await id_n(coll.usr)
	return id_c(coll.usr, {
		_id, utc: Date.now(), nam: `${_id}`,
		nbr, adm1, adm2, msg: "",
	})
}

export async function usr_r<
	P extends keyof Usr
>(
	f: Pick<Usr, "_id"> | Pick<Usr, "nam"> | { nbr: NonNullable<Usr["nbr"]> },
	p: Proj<Usr, P>,
): DocR<Pick<Usr, "_id" | P>> {
	if ("nbr" in f && !is_nbr(f.nbr)) return null
	return await id_r(coll.usr, f, p)
}

export async function usr_u(
	_id: Usr["_id"],
	u: Updt<Usr>,
): DocU {
	const s = u.$set
	if (s?.nbr && !is_nbr(s.nbr)
		|| s?.sms && !is_lim(s.sms.code, lim_code)
		|| s?.jwt && !is_lim(s.jwt.length, lim_jwt)
	) return null
	return await id_u(coll.usr, _id, u)
}

export function usr_d(
	_id: Usr["_id"]
): DocD {
	return id_d(coll.usr, _id)
}
