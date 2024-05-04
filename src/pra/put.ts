import type { Agd, Aut, Cdt, Dbt, Ern, Msg, Soc, Usr } from "../eid/typ.ts"
import type { Pas } from "./pas.ts"
import { Ret, is_put } from "./can.ts"
import { coll } from "../eid/db.ts"
import { is_lim, len_aug } from "../eid/is.ts"
import { usr_u } from "../eid/usr.ts"
import { soc_u, soc_d } from "../eid/soc.ts"
import { agd_d, agd_u } from "../eid/agd.ts"
import { cdt_u, rec_d, rec_r, rec_s } from "../eid/rec.ts"

// 更新操作

export type Put = {
    put: "usr", // 更新用户数据 （本人）
    usr: Usr["_id"],
    nam: Usr["nam"],
    adm1: Usr["adm1"],
    adm2: Usr["adm2"],
    msg: Usr["msg"],
} | {
    put: "soc", // 更新俱乐部数据 （管理员）
    soc: Soc["_id"],
    nam: Soc["nam"],
    adm1: Soc["adm1"],
    adm2: Soc["adm2"],
    sec: Soc["sec"],
} | {
    put: "soc", // 更新俱乐部数据 （管理员）
    del: Soc["_id"], // 删除俱乐部
} | {
    put: "soc", // 更新俱乐部数据 （联络员）
    soc: Soc["_id"],
    msg: Soc["msg"],
} | {
    put: "soc", // 更新俱乐部数据 （联络员）
    soc: Soc["_id"],
    agr: Soc["agr"]["msg"],
} | {
    put: "agd", // 更新活动数据 （联络员）
    del: Agd["_id"], // 删除活动
} | {
    put: "agd", // 更新活动数据 （联络员）
    agd: Agd["_id"],
    nam: Agd["nam"],
    adm1: Agd["adm1"],
    adm2: Agd["adm2"],
    msg: Agd["msg"],
} | {
    put: "cdt", // 更新积分记录（联络员）
    del: Cdt["_id"], // 删除积分记录
} | {
    put: "cdt", // 更新积分记录（联络员）
    aug: Cdt["_id"], // 追加项
    msg: Cdt["msg"],
    amt: Cdt["amt"],
} | {
    put: "cdt", // 更新积分记录（联络员）
    dim: Cdt["_id"], // 撤回追加项
} | {
    put: "cdt", // 更新积分记录（会员）
    agr: Cdt["_id"], // 同意用户协议
} | {
    put: "cdt", // 更新积分记录（会员）
    mov: Cdt["_id"], // 转让积分至 mov
    msg: Cdt["msg"],
    amt: Cdt["amt"],
} | {
    put: "cdt", // 更新积分记录（会员）
    quo: Cdt["_id"]["soc"], // 签到并使用 quota
    msg: Cdt["msg"],
} | {
    put: "dbt", // 更新积分使用（联络员）
    del: Dbt["_id"], // 删除积分使用
} | {
    put: "dbt", // 更新积分使用（联络员）
    sec: Dbt["_id"], // 确认积分使用
} | {
    put: "dbt", // 更新积分使用（会员）
    dbt: Dbt["_id"], // 反馈
    rev: NonNullable<Dbt["rev"]>,
} | {
    put: "ern", // 更新贡献记录（联络员）
    del: Ern["_id"], // 删除
} | {
    put: "wsl" | "lit", // 更新文章（编辑）
    id: Msg["_id"],
    nam: Msg["nam"],
    msg: Msg["msg"],
} | {
    put: "wsl" | "lit", // 更新文章（编辑）
    id: Msg["_id"], // 置顶
    pin: boolean,
} | {
    put: "wsl" | "lit", // 更新文章（编辑）
    del: Msg["_id"], // 删除
} | {
    put: "aut", // 更新管理员权限（超级管理员）
    aut: Aut["aut"],
    wsl: Aut["wsl"],
    lit: Aut["lit"],
}

export type PutRet = {
    usr: Ret<typeof usr_u>,
    soc: Ret<typeof soc_u>,
    agd: Ret<typeof agd_u>,
    cdt: Ret<typeof cdt_u>,
}

export async function put(
    pas: Pas,
    p: Put,
) {
    if (!is_put(pas, p)) return null
    const now = Date.now()
    switch (p.put) {
        case "usr": return usr_u(p.usr, { $set: { nam: p.nam, adm1: p.adm1, adm2: p.adm2, msg: p.msg } })
        case "soc": {
            if ("nam" in p) return soc_u(p.soc, { $set: { nam: p.nam, adm1: p.adm1, adm2: p.adm2, sec: p.sec } })
            else if ("del" in p) return soc_d(p.del)
            else if ("msg" in p) return soc_u(p.soc, { $set: { msg: p.msg } })
            else if ("agr" in p) return soc_u(p.soc, { $set: { agr: { msg: p.agr, utc: p.agr.length > 0 ? now : 0 } } })
            break
        } case "agd": {
            if ("del" in p) return agd_d(p.del)
            else if ("nam" in p) return agd_u(p.agd, { $set: { nam: p.nam, adm1: p.adm1, adm2: p.adm2, msg: p.msg } })
            break
        } case "cdt": {
            if ("del" in p) return rec_d(coll.cdt, p.del)
            else if ("aug" in p) return cdt_u(p.aug, { $push: { aug: { msg: p.msg, amt: p.amt, utc: now, usr: pas.usr } } })
            else if ("dim" in p) return cdt_u(p.dim, { $pop: { aug: 1 } })
            else if ("agr" in p) return cdt_u(p.agr, { $set: { "utc.agr": now } })
            else if ("mov" in p) {
                const [frm, to] = [pas.cdt.find(c => c._id.soc == p.mov.soc), await rec_r(coll.cdt, { _id: p.mov }, { now })]
                if (!frm || !to || !is_lim(Math.max(frm.aug?.length ?? 0, to.aug?.length ?? 0), len_aug - 1)) return null
                const aug = frm.aug ? frm.aug.reduce((a, b) => a + Math.min(b.amt, 0), frm.amt) : frm.amt
                const [dbt] = await rec_s(coll.dbt, { usr: frm._id.usr, soc: frm._id.soc }, { frm: frm.utc.eft })
                if (aug >= (dbt ? dbt.amt : 0) + p.amt) {
                    const f = await cdt_u(frm._id, { $push: { aug: { msg: p.msg, amt: -p.amt, utc: now, usr: pas.usr } } })
                    if (f) return cdt_u(to._id, { $push: { aug: { msg: p.msg, amt: p.amt, utc: now, usr: pas.usr } } })
                }
            } else if ("quo" in p) {
                const c = pas.cdt.find(c => c._id.soc == p.quo)
                if (c && is_lim(c.aug?.length ?? 0, len_aug - 1))
                    return cdt_u(c._id, { $push: { aug: { msg: p.msg, amt: 0, utc: now, usr: pas.usr } } })
            }
            break
        }
    }
    return null
}