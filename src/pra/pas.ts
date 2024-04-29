import { aut_f } from "../eid/aut.ts"
import { DocR, coll } from "../eid/db.ts"
import { id } from "../eid/id.ts"
import { is_id, is_jwt, lim_code } from "../eid/is.ts"
import { rec_f } from "../eid/rec.ts"
import { soc_r } from "../eid/soc.ts"
import type { Agd, Cdt, Soc, Usr } from "../eid/typ.ts"
import { usr_r, usr_u } from "../eid/usr.ts"
import { jwt_sign, jwt_verify } from "../ont/jwt.ts"
import { smssend } from "../ont/sms.ts"
import { utc_h } from "../ont/utc.ts"
import { Ret, is_psg } from "./can.ts"

export type Pas = {
    usr: Usr["_id"],
    nam: Usr["nam"],
    cdt: Cdt[],
    agr: Cdt["_id"] | undefined,
    sec: Soc["_id"][],
    agd: Agd["_id"][],
    aut: Ret<typeof aut_f>,
}

async function pas_of_usr(
    u: Pick<Usr, "_id" | "nam">,
): DocR<Pas> {
    if (!is_id(u._id)) return null
    const [cdt, sec, aut] = await Promise.all([
        rec_f(coll.cdt, { usr: u._id }, { now: Date.now() }), // deno-lint-ignore no-explicit-any
        id(coll.soc, { sec: u._id } as any), aut_f(u._id),
    ])
    const [soc, agd] = await Promise.all([ // deno-lint-ignore no-explicit-any
        cdt ? Promise.all(cdt.map(c => soc_r(c._id.soc, { _id: 1, agr: 1 } as any))) : [],
        id(coll.agd, { soc: { $in: sec } }),
    ])
    return {
        usr: u._id, nam: u.nam, cdt,
        agr: cdt.filter((c, n) =>
            soc[n] && soc[n]!.agr.msg.length > 0 && c.utc.agr < soc[n]!.agr.utc
        ).map(c => c._id)[0],
        sec, agd, aut,
    }
}

type Jwt = { usr: Usr["_id"], utc: number }

const utc_pas = new Date("2023-11-22").getTime()
const h_sms = 1

export async function pas(
    jwt: NonNullable<Usr["jwt"]>,
): DocR<Pas> {
    if (!is_jwt(jwt)) return null
    const t = await jwt_verify<Jwt>(jwt)
    if (!t) return null
    const u = await usr_r({ _id: t.usr }, { nam: 1, sms: 1, jwt: 1 })
    if (u && u.sms && u.sms.utc > utc_pas && u.jwt == jwt)
        return pas_of_usr({ _id: u._id, nam: u.nam })
    return null
}
async function pas_sms(
    nbr: NonNullable<Usr["nbr"]>,
    sms: boolean,
) {
    const u = await usr_r({ nbr }, { sms: 1 })
    if (!u) return null
    const utc = Date.now()
    if (u.sms && utc - u.sms.utc < utc_h * h_sms) return { sms: false, utc: u.sms.utc }
    const code = Math.round(Math.random() * lim_code)
    const c = await usr_u(u._id, { $set: { sms: { code, utc } } })
    if (c) {
        if (sms) {
            const { sent } = await smssend(nbr, `${code}`, `${h_sms}`)
            return { sms: sent }
        }
        return { sms: false }
    }
    return null
}

async function pas_code(
    nbr: NonNullable<Usr["nbr"]>,
    code: NonNullable<Usr["sms"]>["code"],
) {
    const u = await usr_r({ nbr }, { nam: 1, sms: 1, jwt: 1 })
    const utc = Date.now()
    if (u && u.sms && utc - u.sms.utc < utc_h * h_sms && code == u.sms.code) {
        const pas = await pas_of_usr({ _id: u._id, nam: u.nam })
        if (!pas) return null
        if (u.jwt) return { pas, jwt: u.jwt }
        const jwt = await jwt_sign({ usr: pas.usr, utc } as Jwt)
        const c = await usr_u(pas.usr, { $set: { jwt } })
        if (c) return { pas, jwt }
    }
    return null
}

function pas_clr(
    usr: Usr["_id"],
) {
    return usr_u(usr, { $unset: { jwt: "" } })
}

export type Psg = {
    psg: "pas",
} | {
    psg: "sms",
    nbr: NonNullable<Usr["nbr"]>,
    sms: boolean,
} | {
    psg: "code",
    nbr: NonNullable<Usr["nbr"]>,
    code: NonNullable<Usr["sms"]>["code"],
} | {
    psg: "clr",
    usr: Usr["_id"],
}

export type PsgRet = {
    pas: Ret<typeof pas>,
    sms: Ret<typeof pas_sms>,
    code: NonNullable<Ret<typeof pas_code>>["pas"] | null,
    clr: Ret<typeof pas_clr>,
}

export async function psg(
    pas: Pas | null,
    p: Psg,
): Promise<{
    ret: PsgRet[Psg["psg"]],
    jwt?: NonNullable<Ret<typeof pas_code>>["jwt"] | null
}> {
    if (!is_psg(p)) return { ret: null }
    switch (p.psg) {
        case "pas": return { ret: pas }
        case "sms": return { ret: await pas_sms(p.nbr, p.sms) }
        case "code": {
            const r = await pas_code(p.nbr, p.code)
            if (r) return { ret: r.pas, jwt: r.jwt }
            break
        } case "clr": return { ret: await pas_clr(p.usr), jwt: null }
    }
    return { ret: null }
}