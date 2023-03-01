import type { Agd, Soc, Usr } from "../eid/typ.ts"
import type { Pas } from "./pas.ts"
import { usr_u } from "../eid/usr.ts"
import { DocU } from "../db.ts"
import { is_put_agd, is_put_soc, PutAgd, PutRel, PutSoc } from "./con.ts"
import { soc_u } from "../eid/soc.ts"
import { agd_u } from "../eid/agd.ts"

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
	if ("rel" in p) return await soc_u(sid, rel_u(p))
	return null
}

export async function put_agd(
	pas: Pas,
	aid: Agd["_id"],
	p: PutAgd,
): DocU {
	if (!is_put_agd(pas, aid, p)) return null
	if ("nam" in p || "intro" in p) return await agd_u(aid, { $set: p })
	if ("rel" in p) return await agd_u(aid, rel_u(p))
	return null
}
