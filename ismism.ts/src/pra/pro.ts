import type { Agd, Soc, Usr, Work } from "../eid/typ.ts"
import type { Pas } from "./pas.ts"
import { coll, DocU } from "../db.ts"
import { is_pro_agd, is_pro_soc, is_pro_usr, is_pro_work } from "./con.ts"
import { usr_u } from "../eid/usr.ts"
import { soc_u } from "../eid/soc.ts"
import { agd_u } from "../eid/agd.ts"
import { rec_u } from "../eid/rec.ts"

export async function pro_usr(
	pas: Pas,
	re: "rej" | "ref",
	uid: Usr["_id"],
	pro: boolean,
): DocU {
	if (!is_pro_usr(pas, re, uid)) return null
	const u = { [re]: pas.uid }
	return await usr_u(uid, pro ? { $addToSet: u } : { $pull: u })
}

export async function pro_soc(
	pas: Pas,
	re: "rej" | "ref",
	sid: Soc["_id"],
	pro: boolean,
): DocU {
	if (!is_pro_soc(pas, re)) return null
	const u = { [re]: pas.uid }
	return await soc_u(sid, pro ? { $addToSet: u } : { $pull: u })
}

export async function pro_agd(
	pas: Pas,
	re: "rej" | "ref",
	aid: Agd["_id"],
	pro: boolean,
): DocU {
	if (!is_pro_agd(pas, re)) return null
	const u = { [re]: pas.uid }
	return await agd_u(aid, pro ? { $addToSet: u } : { $pull: u })
}

export async function pro_work(
	pas: Pas,
	re: "rej" | "ref",
	workid: Work["_id"],
	pro: boolean,
): DocU {
	if (!is_pro_work(pas, re, workid)) return null
	const u = { [re]: pas.uid }
	return await rec_u(coll.work, workid, pro ? { $addToSet: u } : { $pull: u })
}
