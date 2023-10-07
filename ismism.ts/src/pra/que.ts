import { is_id } from "../eid/is.ts"
import { Agd, Msg, Rec, Soc, Usr } from "../eid/typ.ts"
import { Ret } from "./can.ts"
import { agd, soc, usr } from "./doc.ts"

export type Que = {
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
}

export type QueRet = {
	usr: Ret<typeof usr>,
	soc: Ret<typeof soc>,
	agd: Ret<typeof agd>,
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
		case "usr": return usr("nam" in q ? { nam: q.nam } : { _id: q.usr })
		case "soc": return is_id(q.soc) ? soc(q.soc) : null
		case "agd": return agd(q.agd)
	}

	return null
}
