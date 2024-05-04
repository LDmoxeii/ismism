import type { Agd, Aut, Cdt, Dbt, Ern, Msg, Soc, Usr } from "../eid/typ.ts"

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