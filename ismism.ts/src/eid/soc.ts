import type { Soc } from "./typ.ts"
import { coll, DocC, DocD, DocR, DocU, Updt } from "./db.ts"
import { id_c, id_d, id_n, id_r, id_u } from "./id.ts"
import { is_idl, lim_sec } from "./is.ts"

export async function soc_c(
	nam: Soc["nam"],
	adm1: string,
	adm2: string,
): DocC<Soc["_id"]> {
	return id_c(coll.soc, {
		_id: await id_n(coll.soc), utc: Date.now(),
		nam, adm1, adm2, msg: "",
		sec: [], cde: false,
	})
}

export function soc_r<
	P extends keyof Soc
>(
	_id: Soc["_id"],
	projection: Partial<{ [K in P]: 1 }>
): DocR<Pick<Soc, "_id" | P>> {
	return id_r(coll.soc, { _id }, projection)
}

export async function soc_u(
	_id: Soc["_id"],
	u: Updt<Soc>,
): DocU {
	if (u.$set) {
		const s = u.$set
		if (s.sec && !is_idl(s.sec, lim_sec)) return null
	}
	return await id_u(coll.soc, _id, u)
}

export function soc_d(
	_id: Soc["_id"]
): DocD {
	return id_d(coll.soc, _id)
}
