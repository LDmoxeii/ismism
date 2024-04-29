import type { Agd, Msg, Rec, Soc, Usr } from "../eid/typ.ts";
import { json } from "../ont/json.ts";
import { Ret } from "./can.ts";
import { adm, agd, msg, rec, soc, usr } from "./doc.ts";

export type Que = {
    que: "adm",
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
}

export type QueRet = {
    adm: Ret<typeof adm>,
    usr: Ret<typeof usr>,
    soc: Ret<typeof soc>,
    agd: Ret<typeof agd>,
    cdt: Ret<typeof rec>,
    dbt: Ret<typeof rec>,
    ern: Ret<typeof rec>,
    wsl: Ret<typeof msg>,
    lit: Ret<typeof msg>,
}

export function que(
    s: string
): Promise<QueRet[Que["que"]]> | null {
    const q = json<Que>(s.substring(1))
    if (q) switch (q.que) {
        case "adm": return adm()
        case "usr": return usr("nam" in q ? { nam: q.nam } : { _id: q.usr })
        case "soc": return soc(q.soc)
        case "agd": return agd(q.agd)
        case "cdt": case "dbt": case "ern":
            return rec(q.que, "usr" in q ? { usr: q.usr } : { soc: q.soc }, q.utc)
        case "wsl": case "lit": return msg(q.que, q.msg)
    }
    return null
}