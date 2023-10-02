import { agd_c } from "../eid/agd.ts"
import { coll } from "../eid/db.ts"
import { is_recid } from "../eid/is.ts"
import { msg_c } from "../eid/msg.ts"
import { rec_c } from "../eid/rec.ts"
import { soc_c, soc_r } from "../eid/soc.ts"
import { Agd, Cdt, Dbt, Ern, Lit, Soc, Usr, Wsl } from "../eid/typ.ts"
import { usr_c } from "../eid/usr.ts"
import { Ret, is_pre_agd, is_pre_cdt, is_pre_dbt, is_pre_ern, is_pre_lit, is_pre_soc, is_pre_usr, is_pre_wsl } from "./can.ts"
import { Pas } from "./pas.ts"

export type Pre = {
	pre: "usr",
	nbr: NonNullable<Usr["nbr"]>,
	adm1: Usr["adm1"],
	adm2: Usr["adm1"],
} | {
	pre: "soc",
	nam: Soc["nam"],
	adm1: Soc["adm1"],
	adm2: Soc["adm1"],
} | {
	pre: "agd",
	nam: Agd["nam"],
	soc: Agd["soc"],
} | {
	pre: "cdt",
	cdt: Cdt,
} | {
	pre: "dbt",
	dbt: Dbt,
} | {
	pre: "ern",
	ern: Ern,
} | {
	pre: "wsl",
	nam: Wsl["nam"],
} | {
	pre: "lit",
	nam: Lit["nam"],
}

export type PreRet = {
	pre: "usr",
	ret: Ret<typeof usr_c>,
} | {
	pre: "soc",
	ret: Ret<typeof soc_c>,
} | {
	pre: "agd",
	ret: Ret<typeof agd_c>,
} | {
	pre: "cdt",
	ret: Ret<typeof rec_c>,
} | {
	pre: "dbt",
	ret: Ret<typeof rec_c>,
} | {
	pre: "ern",
	ret: Ret<typeof rec_c>,
} | {
	pre: "wsl",
	ret: Ret<typeof msg_c>,
} | {
	pre: "lit",
	ret: Ret<typeof msg_c>,
}

export async function pre(
	pas: Pas,
	p: Pre,
): Promise<PreRet["ret"]> {
	switch (p.pre) {
		case "usr": {
			const is = is_pre_usr(pas)
				&& typeof p.nbr == "string"
				&& typeof p.adm1 == "string"
				&& typeof p.adm2 == "string"
			return is ? usr_c(p.nbr, p.adm1, p.adm2) : null
		} case "soc": {
			const is = is_pre_soc(pas)
				&& typeof p.nam == "string"
				&& typeof p.adm1 == "string"
				&& typeof p.adm2 == "string"
			return is ? soc_c(p.nam, p.adm1, p.adm2) : null
		} case "agd": {
			const is = is_pre_agd(pas) && typeof p.soc == "number"
			const s = is ? await soc_r(p.soc, { adm1: 1, adm2: 1 }) : null
			return s ? agd_c(p.nam, s.adm1, s.adm2, p.soc) : null
		} case "cdt": {
			const { _id, msg, amt, sec, utc } = p.cdt
			const is = is_pre_cdt(pas, _id.soc)
				&& is_recid(_id)
				&& typeof msg == "string"
				&& typeof amt == "number"
				&& (sec == undefined || typeof sec == "number")
				&& Object.keys(utc).length == 2 && typeof utc.eft == "number" && typeof utc.exp == "number"
			_id.utc = Date.now()
			return is ? rec_c(coll.cdt, { _id, msg, amt, ...sec ? { sec } : {}, utc }) : null
		} case "dbt": {
			const { _id, msg, amt, sec } = p.dbt
			const is = is_pre_dbt(pas, _id.soc)
				&& is_recid(_id)
				&& typeof msg == "string"
				&& typeof amt == "number"
				&& (sec == undefined || typeof sec == "number")
			return is ? rec_c(coll.dbt, { _id, msg, amt, ...sec ? { sec } : {} }) : null
		} case "ern": {
			const { _id, msg, amt, sec } = p.ern
			const is = is_pre_ern(pas, _id.soc)
				&& is_recid(_id)
				&& typeof msg == "string"
				&& typeof amt == "number"
				&& (sec == undefined || typeof sec == "number")
			return is ? rec_c(coll.dbt, { _id, msg, amt, ...sec ? { sec } : {} }) : null
		} case "wsl": {
			const is = is_pre_wsl(pas) && typeof p.nam == "string"
			return is ? msg_c(coll.wsl, p.nam, pas.usr) : null
		} case "lit": {
			const is = is_pre_lit(pas) && typeof p.nam == "string"
			return is ? msg_c(coll.lit, p.nam, pas.usr) : null
		}
	}
	return null
}
