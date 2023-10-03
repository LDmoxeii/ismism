import { agd_d, agd_u } from "../eid/agd.ts"
import { aut_u } from "../eid/aut.ts"
import { coll } from "../eid/db.ts"
import { msg_d, msg_u } from "../eid/msg.ts"
import { rec_d } from "../eid/rec.ts"
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
	cde: boolean,
} | {
	put: "soc",
	soc: Soc["_id"],
	msg: string,
} | {
	put: "agd",
	agd: Agd["_id"],
} | {
	put: "agd",
	agd: Agd["_id"],
	nam: string,
	adm1: string,
	adm2: string,
} | {
	put: "agd",
	agd: Agd["_id"],
	msg: string,
} | {
	put: "cdt",
	id: Cdt["_id"],
} | {
	put: "dbt",
	id: Dbt["_id"],
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
	pin: boolean,
} | {
	put: "aut",
	aut: Usr["_id"][],
	wsl: Usr["_id"][],
	lit: Usr["_id"][],
}

export type PutRet = {
	pre: "usr",
	ret: Ret<typeof usr_u>,
} | {
	pre: "soc",
	ret: Ret<typeof soc_u>,
} | {
	pre: "agd",
	ret: Ret<typeof agd_u>,
} | {
	pre: "cdt" | "dbt" | "ern",
	ret: Ret<typeof rec_d>,
} | {
	pre: "wsl" | "lit",
	ret: Ret<typeof msg_u>,
} | {
	pre: "aut",
	ret: Ret<typeof aut_u>,
}

// deno-lint-ignore require-await
export async function put(
	pas: Pas | null,
	p: Put,
): Promise<PutRet["ret"]> {
	if (!pas || !p || !is_put(pas, p)) return null
	switch (p.put) {
		case "usr": {
			const { nam, adm1, adm2, msg } = p
			return usr_u(p.usr, { $set: { nam, adm1, adm2, msg } })
		} case "soc": {
			if ("msg" in p) return soc_u(p.soc, { $set: { msg: p.msg } })
			if ("nam" in p) {
				const { nam, adm1, adm2, sec, cde } = p
				return soc_u(p.soc, { $set: { nam, adm1, adm2, sec, cde } })
			} else return soc_d(p.soc)
		} case "agd": {
			if ("msg" in p) return agd_u(p.agd, { $set: { msg: p.msg } })
			if ("nam" in p) {
				const { nam, adm1, adm2 } = p
				return agd_u(p.agd, { $set: { nam, adm1, adm2 } })
			} else return agd_d(p.agd)
		} case "cdt": case "dbt": case "ern": {
			return rec_d(coll[p.put], p.id)
		} case "wsl": case "lit": {
			if ("msg" in p) {
				const { nam, msg, pin } = p
				return msg_u(coll[p.put], p.id, { $set: { nam, msg, pin, "utc.put": Date.now() } })
			} else return msg_d(coll[p.put], p.id)
		} case "aut": {
			const { aut, wsl, lit } = p
			return aut_u({ $set: { aut, wsl, lit } })
		}
	}
	return null
}
