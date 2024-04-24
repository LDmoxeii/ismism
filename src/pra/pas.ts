import { aut_f } from "../eid/aut.ts"
import { DocR, coll } from "../eid/db.ts"
import { id } from "../eid/id.ts"
import { is_id, is_jwt } from "../eid/is.ts"
import { rec_f } from "../eid/rec.ts"
import { soc_r } from "../eid/soc.ts"
import type { Agd, Cdt, Soc, Usr } from "../eid/typ.ts"
import { usr_r } from "../eid/usr.ts"
import { jwt_verify } from "../ont/jwt.ts"
import { Ret } from "./can.ts"

// 用户登陆 Pass

export type Pas = {
    usr: Usr["_id"],
    nam: Usr["nam"],
    cdt: Cdt[], // 会员权限
    agr: Cdt["_id"] | undefined, // 待确认的 俱乐部 用户协议
    sec: Soc["_id"][], // 联络员权限
    agd: Agd["_id"][], // 活动联络员权限
    aut: Ret<typeof aut_f>, // 网站管理员权限
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

// 登陆票据
type Jwt = { usr: Usr["_id"], utc: number }

const utc_pas = new Date("2023-11-22").getTime()  // 票据版本时间
const h_sms = 1 // 验证短信的有效时间（小时）

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

// 登陆流程 Passage

export type Psg = {
    psg: "pas",  // 票据登陆
} | {
    psg: "sms",  // 登陆短信
    nbr: NonNullable<Usr["nbr"]>,
    sms: boolean, // 是否发送短信
} | {
    psg: "code", // 验证码登陆
    nbr: NonNullable<Usr["nbr"]>,
    code: NonNullable<Usr["sms"]>["code"],
} | {
    psg: "clr", // 登出
    usr: Usr["_id"],
}