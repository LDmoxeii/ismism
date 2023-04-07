import type { Agd, Lit, Ord, Soc, Usr, Work, Wsl } from "../eid/typ.ts"
import type { Pas } from "./pas.ts"
import { usr_u } from "../eid/usr.ts"
import { coll, DocU } from "../db.ts"
import { is_put_agd, is_put_lit, is_put_ord, is_put_soc, is_put_work, is_put_wsl, PutAgd, PutLit, PutSoc, PutWsl } from "./can.ts"
import { soc_d, soc_r, soc_u } from "../eid/soc.ts"
import { agd_d, agd_u } from "../eid/agd.ts"
import { nrec, rec_d, rec_r, rec_u } from "../eid/rec.ts"
import { rel_u } from "../eid/rel.ts"
import { is_id } from "../eid/is.ts"
import { md_d, md_r, md_u } from "../eid/md.ts"
import { ord_d, ord_u } from "../eid/ord.ts"

export function put_usr(
	pas: Pas,
	p: Pick<Usr, "nam" | "adm1" | "adm2" | "intro">
): DocU {
	return usr_u(pas.uid, { $set: p })
}

export async function put_soc(
	pas: Pas,
	sid: Soc["_id"],
	p: PutSoc | null,
): DocU {
	if (!is_put_soc(pas, sid, p)) return null
	if (p === null) {
		const s = await soc_r(sid, { uid: 1 })
		if (!s || s.uid.length !== 0) return null
		return soc_d(sid)
	}
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
	p: PutAgd | null,
): DocU {
	if (!is_put_agd(pas, aid, p)) return null
	if (p === null) {
		const r = await nrec({ aid })
		if (r === null || r.work !== 0 || r.fund !== 0) return null
		return agd_d(aid)
	}
	if ("nam" in p || "intro" in p || "img" in p || "goal" in p || "ordlim" in p) return agd_u(aid, { $set: p })
	if ("rol" in p) {
		const u = await rel_u(coll.agd, aid, p)
		return u ? agd_u(aid, u) : null
	}
	return null
}

export async function put_ord(
	pas: Pas,
	ordid: Ord["_id"],
	p: { ord: Ord["ord"] } | null,
): DocU {
	if (!is_put_ord(pas, ordid)) return null
	return p === null ? ord_d(ordid) : await ord_u(ordid, { $set: p })
}

export async function put_work(
	pas: Pas,
	workid: Work["_id"],
	p: { msg: string } | { nam: string, src: string } | { nam: string, src: string, utcs: number, utce: number } | null,
): DocU {
	if (pas.uid !== workid.uid) return null
	const w = await rec_r(coll.work, workid, { ref: 1, work: 1 })
	if (!w || !is_put_work(pas, w, p)) return null
	return p === null ? rec_d(coll.work, workid) : rec_u(coll.work, workid, { $set: p })
}

export async function put_wsl(
	pas: Pas,
	wslid: Wsl["_id"],
	p: PutWsl,
): DocU {
	if (!is_id(wslid)) return null
	const wsl = await md_r(coll.wsl, wslid, { uid: 1 })
	if (!wsl || !is_put_wsl(pas, wsl, p)) return null
	return p === null ? md_d(coll.wsl, wslid) : "nam" in p ? md_u(coll.wsl, wslid, {
		$set: { ...p, utcp: Date.now() }
	}) : md_u(coll.wsl, wslid, p.pin ? { $set: { pin: true } } : { $unset: { pin: false } })
}

export async function put_lit(
	pas: Pas,
	litid: Lit["_id"],
	p: PutLit,
): DocU {
	if (!is_id(litid)) return null
	const lit = await md_r(coll.lit, litid, { uid: 1 })
	if (!lit || !is_put_lit(pas, lit, p)) return null
	return p === null ? md_d(coll.lit, litid) : "nam" in p ? md_u(coll.lit, litid, {
		$set: { ...p, utcp: Date.now() }
	}) : md_u(coll.lit, litid, p.pin ? { $set: { pin: true } } : { $unset: { pin: false } })
}
