import { DocU } from "../db.ts"
import { agd_u } from "../eid/agd.ts"
import { Agd, Rec, Soc, Usr } from "../eid/typ.ts"
import { collrec, rec_u } from "../eid/rec.ts"
import { not_recid } from "../eid/is.ts"
import { soc_u } from "../eid/soc.ts"
import { usr_u } from "../eid/usr.ts"
import { Pas } from "./pas.ts"
import { not_aut, not_pro } from "./con.ts"

export async function pro_usr(
	pas: Pas,
	re: "rej" | "ref",
	uid: Usr["_id"],
	pro: boolean,
): DocU {
	if (not_aut(pas.aut, "pre_usr") || not_pro(pas) || pas.ref.includes(uid)) return null
	const u = { [re]: pas.id.uid }
	return await usr_u(uid, pro ? { $addToSet: u } : { $pull: u })
}
export async function pro_soc(
	pas: Pas,
	re: "rej" | "ref",
	sid: Soc["_id"],
	pro: boolean,
): DocU {
	if (not_aut(pas.aut, "pre_soc") || not_pro(pas)) return null
	const u = { [re]: pas.id.uid }
	return await soc_u(sid, pro ? { $addToSet: u } : { $pull: u })
}
export async function pro_agd(
	pas: Pas,
	re: "rej" | "ref",
	aid: Agd["_id"],
	pro: boolean,
): DocU {
	if (not_aut(pas.aut, "pre_agd") || not_pro(pas)) return null
	const u = { [re]: pas.id.uid }
	return await agd_u(aid, pro ? { $addToSet: u } : { $pull: u })
}

export async function pro_rec(
	pas: Pas,
	re: "rej" | "ref",
	rec: "work" | "fund" | string,
	recid: Rec["_id"],
	pro: boolean,
): DocU {
	if (not_recid(recid) || not_pro(pas)) return null
	const c = collrec(rec)
	const not_sec = !pas.aid.sec.includes(recid.aid)
	const not_uid = !pas.aid.uid.includes(recid.aid)
	if (!c || not_sec && re === "ref" || not_sec && not_uid) return null
	const u = { [re]: pas.id.uid }
	return await rec_u(c, recid, pro ? { $addToSet: u } : { $pull: u })
}
