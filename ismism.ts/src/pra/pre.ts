import { Act, Soc, Usr, Agd } from "../eid/typ.ts"
import { act_u, act_r } from "../eid/act.ts"
import { usr_c, usr_u } from "../eid/usr.ts"
import { DocC } from "../db.ts"
import { Pas } from "./pas.ts"
import { soc_c } from "../eid/soc.ts"
import { agd_c } from "../eid/agd.ts"
import { is_id } from "../eid/is.ts";
import { not_aut, not_pro } from "./con.ts";

export async function pre_usract(
	actid: Act["_id"],
	nbr: NonNullable<Usr["nbr"]>,
	adm1: string,
	adm2: string,
): DocC<Usr["_id"]> {
	const a = await act_r(actid)
	if (a) switch (a.act) {
		case "usrnew": {
			const uid = await usr_c(nbr, a.ref, adm1, adm2)
			if (is_id(uid)) await act_u(actid, { $set: { exp: Date.now() } })
			return uid
		} case "usrnbr": {
			const u = await usr_u(a.uid, { $set: { nbr, adm1, adm2 } })
			if (u && u > 0) {
				await act_u(actid, { $set: { exp: Date.now() } })
				return a.uid
			} break
		}
	}
	return null
}

export async function pre_usr(
	pas: Pas,
	nbr: NonNullable<Usr["nbr"]>,
	adm1: string,
	adm2: string,
): DocC<Usr["_id"]> {
	if (not_aut(pas.aut, "pre_usr") || not_pro(pas)) return null
	return await usr_c(nbr, [pas.id.uid], adm1, adm2)
}
export async function pre_soc(
	pas: Pas,
	nam: Soc["nam"],
	adm1: string,
	adm2: string,
	intro: string,
): DocC<Soc["_id"]> {
	if (not_aut(pas.aut, "pre_soc") || not_pro(pas)) return null
	return await soc_c(nam, [pas.id.uid], adm1, adm2, intro)
}
export async function pre_agd(
	pas: Pas,
	nam: Agd["nam"],
	adm1: string,
	adm2: string,
	intro: string,
): DocC<Soc["_id"]> {
	if (not_aut(pas.aut, "pre_agd") || not_pro(pas)) return null
	return await agd_c(nam, [pas.id.uid], adm1, adm2, intro)
}
