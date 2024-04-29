import type { Agd, Cdt, Dbt, Ern, Lit, Soc, Usr, Wsl } from "../eid/typ.ts"
import type { Pas } from "./pas.ts"
import { agd_c } from "../eid/agd.ts"
import { soc_c, soc_r } from "../eid/soc.ts"
import { usr_c } from "../eid/usr.ts"
import { Ret, is_pre } from "./can.ts"

export type Pre = {
    pre: "usr",
    nbr: NonNullable<Usr["nbr"]>,
    adm1: Usr["adm1"],
    adm2: Usr["adm2"],
} | {
    pre: "soc",
    nam: Soc["nam"],
    adm1: Soc["adm1"],
    adm2: Soc["adm2"],
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
    usr: Ret<typeof usr_c>,
    soc: Ret<typeof soc_c>,
    agd: Ret<typeof agd_c>,
}

export async function pre(
    pas: Pas,
    p: Pre,
) {
    if (!is_pre(pas, p)) return null
    switch (p.pre) {
        case "usr": return usr_c(p.nbr, p.adm1, p.adm2)
        case "soc": return soc_c(p.nam, p.adm1, p.adm2)
        case "agd": {
            const s = await soc_r(p.soc, { adm1: 1, adm2: 1 })
            return s ? agd_c(p.nam, s.adm1, s.adm2, p.soc) : null
        }
    }
    return null
}
