import type { Agd, Soc, Usr, Work } from "../eid/typ.ts"
import type { Pas } from "./pas.ts"
import { usr_u } from "../eid/usr.ts"
import { coll, DocU } from "../db.ts"
import { is_put_agd, is_put_soc, is_put_work, PutAgd, PutRel, PutSoc } from "./con.ts"
import { soc_r, soc_u } from "../eid/soc.ts"
import { agd_r, agd_u } from "../eid/agd.ts"
import { rec_r, rec_u } from "../eid/rec.ts"

export async function put_usr(
	pas: Pas,
	p: Pick<Usr, "nam" | "adm1" | "adm2" | "intro">
): DocU {
	return await usr_u(pas.uid, { $set: p })
}

function rel_u(
	p: PutRel
) {
	if ("add" in p) {
		const u = { [p.rel]: p.uid }
		if (p.add && p.rel === "uid")
			return { $addToSet: u, $pull: { res: p.uid } }
		return p.add ? { $addToSet: u } : { $pull: u }
	} else return { $set: { [p.rel]: [] } }
}

export async function put_soc(
	pas: Pas,
	sid: Soc["_id"],
	p: PutSoc,
): DocU {
	if (!is_put_soc(pas, sid, p)) return null
	if ("nam" in p || "intro" in p) return await soc_u(sid, { $set: p })
	if ("rel" in p) {
		if ("add" in p && p.add && p.rel === "uid") {
			const s = await soc_r(sid, { res: 1 })
			if (!s || !s.res.includes(p.uid)) return null
		}
		return await soc_u(sid, rel_u(p))
	}
	return null
}

export async function put_agd(
	pas: Pas,
	aid: Agd["_id"],
	p: PutAgd,
): DocU {
	if (!is_put_agd(pas, aid, p)) return null
	if ("nam" in p || "intro" in p) return await agd_u(aid, { $set: p })
	if ("rel" in p) {
		if ("add" in p && p.add && p.rel === "uid") {
			const a = await agd_r(aid, { res: 1 })
			if (!a || !a.res.includes(p.uid)) return null
		}
		return await agd_u(aid, rel_u(p))
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
