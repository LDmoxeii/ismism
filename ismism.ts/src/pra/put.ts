import { agd_d, agd_u } from "../eid/agd.ts"
import { aut_u } from "../eid/aut.ts"
import { coll } from "../eid/db.ts"
import { msg_d, msg_u } from "../eid/msg.ts"
import { cdt_u, dbt_s, rec_d } from "../eid/rec.ts"
import { soc_d, soc_u } from "../eid/soc.ts"
import { Agd, Cdt, Dbt, Ern, Msg, Soc, Usr } from "../eid/typ.ts"
import { usr_u } from "../eid/usr.ts"
import { Ret, is_put } from "./can.ts"
import { Pas } from "./pas.ts"

export type Put = {
	put: "usr",
	usr: Usr["_id"],
	nam: string,
	adm1: string,
	adm2: string,
	msg: string,
} | {
	put: "soc",
	soc: Soc["_id"],
} | {
	put: "soc",
	soc: Soc["_id"],
	nam: string,
	adm1: string,
	adm2: string,
	sec: Soc["sec"],
} | {
	put: "soc",
	soc: Soc["_id"],
	msg: string,
} | {
	put: "soc",
	soc: Soc["_id"],
	agr: string,
} | {
	put: "agd",
	agd: Agd["_id"],
} | {
	put: "agd",
	agd: Agd["_id"],
	nam: string,
	adm1: string,
	adm2: string,
	msg: string,
} | {
	put: "cdt",
	id: Cdt["_id"],
} | {
	put: "cdt",
	id: Cdt["_id"],
	agr: Cdt["utc"]["agr"],
} | {
	put: "dbt",
	id: Dbt["_id"],
} | {
	put: "dbt",
	id: Dbt["_id"],
	sec: NonNullable<Dbt["sec"]>,
} | {
	put: "ern",
	id: Ern["_id"],
} | {
	put: "wsl" | "lit",
	id: Msg["_id"],
} | {
	put: "wsl" | "lit",
	id: Msg["_id"],
	nam: string,
	msg: string,
} | {
	put: "wsl" | "lit",
	id: Msg["_id"],
	pin: boolean,
} | {
	put: "aut",
	aut: Usr["_id"][],
	wsl: Usr["_id"][],
	lit: Usr["_id"][],
}

export type PutRet = {
	usr: Ret<typeof usr_u>,
	soc: Ret<typeof soc_u>,
	agd: Ret<typeof agd_u>,
	cdt: Ret<typeof rec_d> | Ret<typeof cdt_u>,
	dbt: Ret<typeof rec_d>,
	ern: Ret<typeof rec_d>,
	wsl: Ret<typeof msg_u>,
	lit: Ret<typeof msg_u>,
	aut: Ret<typeof aut_u>,
}

// deno-lint-ignore require-await
export async function put(
	pas: Pas | null,
	p: Put,
) {
	if (!pas || !p || !is_put(pas, p)) return null
	switch (p.put) {
		case "usr": {
			const { nam, adm1, adm2, msg } = p
			return usr_u(p.usr, { $set: { nam, adm1, adm2, msg } })
		} case "soc": {
			if ("msg" in p) return soc_u(p.soc, { $set: { msg: p.msg } })
			else if ("agr" in p) return soc_u(p.soc, { $set: { agr: { msg: p.agr, utc: p.agr.length > 0 ? Date.now() : 0 } } })
			else if ("nam" in p) {
				const { nam, adm1, adm2, sec } = p
				return soc_u(p.soc, { $set: { nam, adm1, adm2, sec } })
			} else return soc_d(p.soc)
		} case "agd": {
			if ("nam" in p) {
				const { nam, adm1, adm2 } = p
				return agd_u(p.agd, { $set: { nam, adm1, adm2, msg: p.msg } })
			} else return agd_d(p.agd)
		} case "cdt": case "dbt": case "ern": {
			if ("agr" in p) return cdt_u(p.id, Date.now())
			else if ("sec" in p) return dbt_s(p.id, p.sec)
			else return rec_d(coll[p.put], p.id)
		} case "wsl": case "lit": {
			if ("msg" in p) return msg_u(coll[p.put], p.id, { $set: { nam: p.nam, msg: p.msg, "utc.put": Date.now() } })
			else if ("pin" in p) return msg_u(coll[p.put], p.id, p.pin ? { $set: { pin: true } } : { $unset: { pin: true } })
			else return msg_d(coll[p.put], p.id)
		} case "aut": {
			const { aut, wsl, lit } = p
			return aut_u({ $set: { aut, wsl, lit } })
		}
	}
	return null
}
