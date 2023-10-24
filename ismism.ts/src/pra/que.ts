import { is_id } from "../eid/is.ts"
import { Agd, Msg, Rec, Soc, Usr } from "../eid/typ.ts"
import { Ret } from "./can.ts"
import { adm, agd, msg, rec, soc, usr } from "./doc.ts"

export type Que = {
	que: "adm1" | "adm2"
} | {
	que: "usr",
	usr: Usr["_id"],
} | {
	que: "usr",
	nam: Usr["nam"],
} | {
	que: "soc",
	soc: Soc["_id"],
} | {
	que: "agd",
	agd: Agd["_id"],
} | {
	que: "cdt" | "dbt" | "ern",
	usr: Rec["_id"]["usr"],
	utc: Rec["_id"]["utc"],
} | {
	que: "cdt" | "dbt" | "ern",
	soc: Rec["_id"]["soc"],
	utc: Rec["_id"]["utc"],
} | {
	que: "wsl" | "lit",
	msg: Msg["_id"] | 0,
	f?: true,
}

export type QueRet = {
	adm1: Ret<typeof adm>,
	adm2: Ret<typeof adm>,
	usr: Ret<typeof usr>,
	soc: Ret<typeof soc>,
	agd: Ret<typeof agd>,
	cdt: Ret<typeof rec>,
	dbt: Ret<typeof rec>,
	ern: Ret<typeof rec>,
	wsl: Ret<typeof msg>,
	lit: Ret<typeof msg>,
}

function json(
	s: string,
): Que | null {
	try { return JSON.parse(`{"${s.replace(/&/g, ',"').replace(/=/g, '":')}}`) }
	catch { return null }
}

export function que(
	s: string,
) {
	const q = json(s)

	if (q) switch (q.que) {
		case "adm1": case "adm2": return adm(q.que)
		case "usr": return usr("nam" in q ? { nam: q.nam } : { _id: q.usr })
		case "soc": return is_id(q.soc) ? soc(q.soc) : null
		case "agd": return is_id(q.agd) ? agd(q.agd) : null
		case "cdt": case "dbt": case "ern":
			return rec(q.que, "usr" in q ? { usr: q.usr } : { soc: q.soc }, q.utc)
		case "wsl": case "lit": return msg(q.que, q.msg, q.f)
	}

	return null
}
