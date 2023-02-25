import type { Soc } from "./typ.ts"
import { coll, DocC, DocD, DocR, DocU, Update } from "../db.ts"
import { id_c, id_d, id_n, id_r, id_u } from "./id.ts"
import { is_idl, is_lim, lim_res_def, lim_res_max, lim_sec, lim_uid_def, lim_uid_max } from "./is.ts"

export async function soc_c(
	nam: Soc["nam"],
	adm1: string,
	adm2: string,
): DocC<Soc["_id"]> {
	return id_c(coll.soc, {
		_id: await id_n(coll.soc), nam,
		utc: Date.now(), adm1, adm2,
		intro: "",
		rej: [], ref: [],
		sec: [],
		uidlim: lim_uid_def, uid: [],
		reslim: lim_res_def, res: [],
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
	sid: Soc["_id"],
	u: Update<Soc>,
): DocU {
	if (u.$set) {
		const s = u.$set
		if (s.sec && !is_idl(s.sec, lim_sec)) return null
		if (s.uidlim !== undefined && !is_lim(s.uidlim, lim_uid_max)) return null
		if (s.uid && !is_idl(s.uid, s.uidlim ?? lim_uid_max)) return null
		if (s.reslim !== undefined && !is_lim(s.reslim, lim_res_max)) return null
		if (s.res && !is_idl(s.res, s.reslim ?? lim_res_max)) return null
	}
	return await id_u(coll.soc, sid, u)
}

export function soc_d(
	sid: Soc["_id"]
): DocD {
	return id_d(coll.soc, sid)
}
