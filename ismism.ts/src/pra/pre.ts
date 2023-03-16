import type { Act, Agd, Aut, Fund, Lit, Soc, Usr, Work, Wsl } from "../eid/typ.ts"
import type { Pas } from "./pas.ts"
import { is_pre_agd, is_pre_lit, is_pre_soc, is_pre_usr, is_pre_work, is_pre_wsl, is_pre_aut } from "./con.ts"
import { coll, DocC } from "../db.ts"
import { act_r, act_u } from "../eid/act.ts"
import { usr_c, usr_r, usr_u } from "../eid/usr.ts"
import { soc_c } from "../eid/soc.ts"
import { agd_c } from "../eid/agd.ts"
import { rec_c } from "../eid/rec.ts"
import { md_c } from "../eid/md.ts"
import { is_aut, is_id, is_lim, is_msg, is_nam, is_url, lim_aud, lim_aut, lim_lit, lim_wsl } from "../eid/is.ts"
import { aut_c, aut_d, aut_g, aut_r, aut_u } from "../eid/aut.ts"

export async function pre_usr(
	pa: { pas: Pas } | { actid: Act["_id"] },
	nbr: NonNullable<Usr["nbr"]>,
	adm1: string,
	adm2: string,
): DocC<Usr["_id"]> {
	if ("actid" in pa) {
		const a = await act_r(pa.actid)
		if (a) switch (a.act) {
			case "fund": {
				const uid = await usr_c(nbr, adm1, adm2)
				if (!is_id(uid!)) return null
				const utc = Date.now()
				await Promise.all([
					act_u(pa.actid, { $set: { exp: utc } }),
					rec_c(coll.fund, { _id: { uid, aid: a.aid, utc }, fund: 0, msg: a.msg }),
				])
				return uid
			} case "nbr": {
				const u = await usr_u(a.uid, { $set: { nbr, adm1, adm2 } })
				if (u && u > 0) {
					await act_u(pa.actid, { $set: { exp: Date.now() } })
					return a.uid
				} break
			}
		}
	} else if ("pas" in pa && is_pre_usr(pa.pas)) return usr_c(nbr, adm1, adm2)
	return null
}

export async function pre_soc(
	pas: Pas,
	nam: Soc["nam"],
	adm1: string,
	adm2: string,
): DocC<Soc["_id"]> {
	if (!is_pre_soc(pas)) return null
	return await soc_c(nam, adm1, adm2)
}

export async function pre_agd(
	pas: Pas,
	nam: Agd["nam"],
	adm1: string,
	adm2: string,
): DocC<Agd["_id"]> {
	if (!is_pre_agd(pas)) return null
	return await agd_c(nam, adm1, adm2)
}

export async function pre_work(
	pas: Pas,
	aid: Agd["_id"],
	work: { msg: string } | { nam: string, src: string },
): DocC<Work["_id"]> {
	if (!is_pre_work(pas, aid)) return null
	const r = { _id: { uid: pas.uid, aid, utc: Date.now() }, rej: [], ref: [] }
	if ("msg" in work && is_msg(work.msg))
		return await rec_c(coll.work, { ...r, work: "work", ...work })
	else if ("src" in work && is_msg(work.nam) && is_url(work.src))
		return await rec_c(coll.work, { ...r, work: "video", ...work })
	return null
}

export async function pre_fund(
	pas: Pas,
	actid: Act["_id"],
): DocC<Fund["_id"]> {
	const a = await act_r(actid)
	if (!a || a.act !== "fund") return null
	const utc = Date.now()
	await act_u(actid, { $set: { exp: utc } })
	return rec_c(coll.fund, { _id: { uid: pas.uid, aid: a.aid, utc }, fund: 0, msg: a.msg })
}

export async function pre_aut(
	pas: Pas,
	nam: Usr["nam"],
	aut: Aut["aut"][0],
): DocC<Aut["_id"]> {
	if (aut === "sup" || !is_nam(nam) || !is_pre_aut(pas)) return null
	const { _id } = await usr_r({ nam }, {}) ?? {}
	const lim = aut === "aud" ? lim_aud :
		aut === "aut" ? lim_aut : aut === "wsl" ? lim_wsl : aut === "lit" ? lim_lit : 0
	if (!is_id(_id!)) return null
	const [a, g] = await Promise.all([aut_r(_id), aut_g()])
	if (is_lim((g[aut]?.length ?? 0) + (g[aut]?.includes(_id) ? -1 : 1), lim)) {
		if (a) {
			if (is_aut(a.aut, aut) && a.aut.length === 1) {
				await aut_d(_id)
				return _id
			}
			const u = await aut_u(_id, is_aut(a.aut, aut) ? { $pull: { aut } } : { $addToSet: { aut } })
			return u && u > 0 ? _id : null
		}
		else return aut_c({ _id, aut: [aut] })
	}
	return null
}

export async function pre_wsl(
	pas: Pas,
	nam: Wsl["nam"],
): DocC<Wsl["_id"]> {
	if (!is_nam(nam) || !is_pre_wsl(pas)) return null
	return await md_c(coll.wsl, { uid: pas.uid, nam })
}

export async function pre_lit(
	pas: Pas,
	nam: Lit["nam"],
): DocC<Lit["_id"]> {
	if (!is_nam(nam) || !is_pre_lit(pas)) return null
	return await md_c(coll.lit, { uid: pas.uid, nam })
}
