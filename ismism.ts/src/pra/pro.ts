import type { Agd, Re, Soc, Usr, Work } from "../eid/typ.ts"
import type { Pas } from "./pas.ts"
import { coll, DocU } from "../db.ts"
import { is_pro_agd, is_pro_soc, is_pro_usr, is_pro_work } from "./con.ts"
import { usr_u } from "../eid/usr.ts"
import { soc_u } from "../eid/soc.ts"
import { agd_u } from "../eid/agd.ts"
import { rec_u } from "../eid/rec.ts"
import { re_u } from "../eid/re.ts"
import { is_id } from "../eid/is.ts"

export async function pro_usr(
	pas: Pas,
	re: keyof Re,
	uid: Usr["_id"],
	add: boolean,
): DocU {
	if (!is_pro_usr(pas, re, uid)) return null
	const u = await re_u(coll.usr, uid, { re, add, uid: pas.uid })
	return u ? usr_u(uid, u) : null
}

export async function pro_soc(
	pas: Pas,
	re: keyof Re,
	sid: Soc["_id"],
	add: boolean,
): DocU {
	if (!is_pro_soc(pas) || !is_id(sid)) return null
	const u = await re_u(coll.soc, sid, { re, add, uid: pas.uid })
	return u ? soc_u(sid, u) : null
}

export async function pro_agd(
	pas: Pas,
	re: keyof Re,
	aid: Agd["_id"],
	add: boolean,
): DocU {
	if (!is_pro_agd(pas) || !is_id(aid)) return null
	const u = await re_u(coll.agd, aid, { re, add, uid: pas.uid })
	return u ? agd_u(aid, u) : null

}

export async function pro_work(
	pas: Pas,
	re: keyof Re,
	workid: Work["_id"],
	add: boolean,
): DocU {
	if (!is_pro_work(pas, re, workid)) return null
	const u = await re_u(coll.work, workid, { re, add, uid: pas.uid })
	return u ? rec_u(coll.work, workid, u) : null
}
