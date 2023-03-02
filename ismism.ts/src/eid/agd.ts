import type { Agd } from "./typ.ts"
import { coll, DocC, DocD, DocR, DocU, Update } from "../db.ts"
import { id_c, id_d, id_n, id_r, id_u } from "./id.ts"
import { is_goal, is_idl, is_img, is_lim, is_url, lim_res_def, lim_res_max, lim_sec, lim_uid_def, lim_uid_max } from "./is.ts"

export async function agd_c(
	nam: Agd["nam"],
	adm1: string,
	adm2: string,
): DocC<Agd["_id"]> {
	return id_c(coll.agd, {
		_id: await id_n(coll.agd), nam,
		utc: Date.now(), adm1, adm2,
		intro: "",
		rej: [], ref: [],
		sec: [],
		uidlim: lim_uid_def, uid: [],
		reslim: lim_res_def, res: [],
		account: "", budget: 0, fund: 0, expense: 0,
		goal: [], img: [],
	})
}

export function agd_r<
	P extends keyof Agd
>(
	_id: Agd["_id"],
	projection: Partial<{ [K in P]: 1 }>
): DocR<Pick<Agd, "_id" | P>> {
	return id_r(coll.agd, { _id }, projection)
}

export async function agd_u(
	aid: Agd["_id"],
	u: Update<Agd>,
): DocU {
	if (u.$set) {
		const s = u.$set
		if (s.sec && !is_idl(s.sec, lim_sec)) return null
		if (s.uidlim !== undefined && !is_lim(s.uidlim, lim_uid_max)) return null
		if (s.uid && !is_idl(s.uid, s.uidlim ?? lim_uid_max)) return null
		if (s.reslim !== undefined && !is_lim(s.reslim, lim_res_max)) return null
		if (s.res && !is_idl(s.res, s.reslim ?? lim_res_max)) return null
		if (s.account && !is_url(s.account)) return null
		if ((s.budget || s.fund || s.expense) && !(is_lim(s.fund!, s.budget!) && is_lim(s.expense!, s.fund!))) return null
		if (s.goal && !is_goal(s.goal)) return null
		if (s.img && !is_img(s.img)) return null
	}
	return await id_u(coll.agd, aid, u)
}

export function agd_d(
	aid: Agd["_id"]
): DocD {
	return id_d(coll.agd, aid)
}
