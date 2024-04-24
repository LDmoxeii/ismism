import type { Aut, Cdt, Dbt, Id, Rec } from "./typ.ts"

export const lim_code = 999999
export const lim_amt = 999999

export const len_sec = 8
export const len_aut = {
    sup: 2,
    aut: 8,
    wsl: 32,
    lit: 32,
}
export const len_msg_id = 2048
export const len_msg_rec = 256
export const len_msg_agr = 2048 * 8
export const len_msg_pin = 4
export const len_msg = 2048 * 8
export const len_rec_frm = 2048 * 8
export const len_rec_to = 64
export const len_rec_now = 1024
export const len_jwt = 512

export function is_lim(
    num: number,
    max: number,
    min: number = 0,
) {
    return Number.isInteger(num)
        && min <= num
        && max >= num
}


export function is_id(
    id: Id["_id"],
) {
    return Number.isInteger(id) && id > 0
}


export function is_idl(
    idl: Id["_id"][],
    len: number,
) {
    return idl.length <= len && idl.every(is_id)
}

export function is_in(
    idl: Id["_id"][],
    is: Id["_id"],
){
    return idl.includes(is)
}

export function is_utc(
    utc: number,
) {
    return Number.isInteger(utc)
}

export function is_nam(
    nam: string,
) {
    return typeof nam == "string"
        && /^[\u4E00-\u9FFF]{2,16}$/.test(nam)
}

export function is_nbr(
    nbr: string,
) {
    return typeof nbr == "string"
        && /^1\d{10}$/.test(nbr)
}

export function is_msg(
    mag: string,
    len: number,
) {
    return typeof mag == "string"
        && mag.length <= len
}

export function is_jwt(
    jwt: string,
) {
    return typeof jwt == "string"
        && jwt.length == len_jwt
}

export function is_recid(
    id: Rec["_id"],
) {
    return Object.keys(id).length === 3
        && is_id(id.usr)
        && is_id(id.soc)
        && is_utc(id.utc)
}

export function is_rec(
    rec: Rec,
) {
    const { _id, msg, amt, sec } = rec
    return is_recid(_id)
        && is_msg(msg, len_msg_rec)
        && is_lim(amt, lim_amt, -lim_amt)
        && (sec == undefined || is_id(sec))
}

export function is_aug(
    aug: NonNullable<Cdt["aug"]>[0],
) {
    return Object.keys(aug).length === 4
        && is_msg(aug.msg, len_msg_rec)
        && is_lim(aug.amt, lim_amt, -lim_amt)
        && is_utc(aug.utc) && is_id(aug.usr)
}

export function is_cdt(
    cdt: Cdt,
) {
    const { utc, aug } = cdt
    return is_rec(cdt)
        && Object.keys(utc).length === 3
        && is_utc(utc.eft)
        && is_utc(utc.exp)
        && is_utc(utc.agr)
        && (aug == undefined || aug.every(is_aug))
}

export function is_rev(
    rev: NonNullable<Dbt["rev"]>,
) {
    return Object.keys(rev).length === 3
        && is_msg(rev.mag, len_msg_rec)
        && [1, 2, 3, 4, 5].includes(rev.rev)
        && is_utc(rev.utc)
}

export function is_aut(
    aut: Aut
) {
    return Object.keys(aut).length === 5
        && aut._id === 1
        && is_idl(aut.sup, len_aut.sup)
        && is_idl(aut.aut, len_aut.aut)
        && is_idl(aut.wsl, len_aut.wsl)
        && is_idl(aut.lit, len_aut.lit)
}