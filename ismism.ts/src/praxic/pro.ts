import { DocU } from "../db.ts"
import { agenda_u } from "../eidetic/agenda.ts"
import { Agenda, Rec, Soc, User } from "../eidetic/dbtyp.ts"
import { collrec, not_recid, not_rol, rec_u } from "../eidetic/rec.ts"
import { soc_u } from "../eidetic/soc.ts"
import { user_u } from "../eidetic/user.ts"
import { not_aut, Pas } from "./pas.ts"

export function is_pro(
	{ rej, ref }: Pas,
): boolean {
	return rej.length < 2 && ref.length >= 2
}
export function not_pro(
	pas: Pas,
) {
	return !is_pro(pas)
}

export function is_re(
	re?: null | string
): re is "rej" | "ref" {
	return re === "rej" || re === "ref"
}

export async function pro_user(
	pas: Pas,
	re: "rej" | "ref",
	uid: User["_id"],
	pro: boolean,
): DocU {
	if (not_aut(pas, pro_user.name) || not_pro(pas) || pas.ref.includes(uid)) return null
	const u = { [re]: pas.id.uid }
	return await user_u(uid, pro ? { $addToSet: u } : { $pull: u })
}
export async function pro_soc(
	pas: Pas,
	re: "rej" | "ref",
	sid: Soc["_id"],
	pro: boolean,
): DocU {
	if (not_aut(pas, pro_soc.name) || not_pro(pas)) return null
	const u = { [re]: pas.id.uid }
	return await soc_u(sid, pro ? { $addToSet: u } : { $pull: u })
}
export async function pro_agenda(
	pas: Pas,
	re: "rej" | "ref",
	aid: Agenda["_id"],
	pro: boolean,
): DocU {
	if (not_aut(pas, pro_agenda.name) || not_pro(pas)) return null
	const u = { [re]: pas.id.uid }
	return await agenda_u(aid, pro ? { $addToSet: u } : { $pull: u })
}

export async function pro_rec(
	pas: Pas,
	re: "rej" | "ref",
	rec: "worker" | "work" | "fund" | string,
	recid: Rec["_id"],
	pro: boolean,
): DocU {
	if (not_recid(recid) || not_pro(pas)) return null
	const c = collrec(rec)
	const not_sec = not_rol(pas.rol, [recid.aid, "sec"])
	const not_worker = not_rol(pas.rol, [recid.aid, "worker"])
	if (!c || not_sec && re === "ref" || not_sec && not_worker) return null
	const u = { [re]: pas.id.uid }
	return await rec_u(c, recid, pro ? { $addToSet: u } : { $pull: u })
}
