import type { Agd, Soc, Usr, Work } from "../eid/typ.ts"
import type { Pas } from "./pas.ts"
import { usr_u } from "../eid/usr.ts"
import { coll, DocU } from "../db.ts"
import { is_put_agd, is_put_soc, is_put_work, PutAgd, PutSoc } from "./con.ts"
import { soc_u } from "../eid/soc.ts"
import { agd_u } from "../eid/agd.ts"
import { rec_r, rec_u } from "../eid/rec.ts"
import { rel_u } from "../eid/rel.ts"

export function put_usr(
	pas: Pas,
	p: Pick<Usr, "nam" | "adm1" | "adm2" | "intro">
): DocU {
	return usr_u(pas.uid, { $set: p })
}

export async function put_soc(
	pas: Pas,
	sid: Soc["_id"],
	p: PutSoc,
): DocU {
	if (!is_put_soc(pas, sid, p)) return null
	if ("nam" in p || "intro" in p) return soc_u(sid, { $set: p })
	if ("rol" in p) {
		const u = await rel_u(coll.soc, sid, p)
		return u ? soc_u(sid, u) : null
	}
	return null
}

export async function put_agd(
	pas: Pas,
	aid: Agd["_id"],
	p: PutAgd,
): DocU {
	if (!is_put_agd(pas, aid, p)) return null
	if ("nam" in p || "intro" in p || "img" in p || "goal" in p) return agd_u(aid, { $set: p })
	if ("rol" in p) {
		const u = await rel_u(coll.agd, aid, p)
		return u ? agd_u(aid, u) : null
	}
	return null
}

export async function put_work(
	pas: Pas,
	workid: Work["_id"],
	p: { msg: string } | { nam: string, src: string },
): DocU {
	if (pas.uid !== workid.uid) return null
	const w = await rec_r(coll.work, workid, { ref: 1, work: 1 })
	if (!w || !is_put_work(pas, w, p)) return null
	return rec_u(coll.work, workid, { $set: p })
}
