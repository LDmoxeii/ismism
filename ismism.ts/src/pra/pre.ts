import type { Agd, Cdt, Dbt, Ern, Lit, Soc, Usr, Wsl } from "../eid/typ.ts"
import { agd_c } from "../eid/agd.ts"
import { coll } from "../eid/db.ts"
import { msg_c } from "../eid/msg.ts"
import { rec_c } from "../eid/rec.ts"
import { soc_c, soc_r } from "../eid/soc.ts"
import { usr_c } from "../eid/usr.ts"
import { Ret, is_pre } from "./can.ts"
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
	if (!is_pre(pas, p)) return null
	switch (p.pre) {
		case "usr": {
			return usr_c(p.nbr, p.adm1, p.adm2)
		} case "soc": {
			return soc_c(p.nam, p.adm1, p.adm2)
		} case "agd": {
			const s = await soc_r(p.soc, { adm1: 1, adm2: 1 })
			return s ? agd_c(p.nam, s.adm1, s.adm2, p.soc) : null
		} case "cdt": {
			const { _id, msg, amt, sec, utc } = p.cdt
			return rec_c(coll.cdt, { _id, msg, amt, ...sec ? { sec } : {}, utc })
		} case "dbt": {
			const { _id, msg, amt, sec } = p.dbt
			return rec_c(coll.dbt, { _id, msg, amt, ...sec ? { sec } : {} })
		} case "ern": {
			const { _id, msg, amt, sec } = p.ern
			return rec_c(coll.ern, { _id, msg, amt, ...sec ? { sec } : {} })
		} case "wsl": {
			return msg_c(coll.wsl, p.nam, pas.usr)
		} case "lit": {
			return msg_c(coll.lit, p.nam, pas.usr)
		}
	}
	return null
}
