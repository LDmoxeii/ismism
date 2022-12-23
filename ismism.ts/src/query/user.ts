import { jwt_sign, jwt_verify } from "../aut.ts"
import { coll } from "../db.ts"
import { User } from "../dbtyp.ts"
import { smssend } from "../sms.ts"
import { idname, not_id } from "./id.ts"
import { nrec_of_uid } from "./rec.ts"
import { soc_of_uid } from "./soc.ts"

async function user_of_uid(
	uid: number
): Promise<Pick<User, "name" | "utc" | "referer" | "intro"> | null> {
	if (not_id(uid)) return null
	const projection = { _id: 0, name: 1, utc: 1, referer: 1, intro: 1 }
	return await coll.user.findOne({ _id: uid }, { projection }) ?? null
}

async function pass_of_uid(
	uid: number
): Promise<Pick<User, "pcode" | "ptoken"> | null> {
	if (not_id(uid)) return null
	const projection = { _id: 0, pcode: 1, ptoken: 1 }
	return await coll.user.findOne({ _id: uid }, { projection }) ?? null
}
async function pass_of_nbr(
	nbr: string
): Promise<Pick<User, "_id" | "pcode" | "ptoken"> | null> {
	if (nbr.length != 11) return null
	const projection = { _id: 1, pcode: 1, ptoken: 1 }
	return await coll.user.findOne({ nbr }, { projection }) ?? null
}

export async function user(
	uid: number
) {
	if (not_id(uid)) return null
	const [u, soc, nrec] = await Promise.all([
		user_of_uid(uid),
		soc_of_uid(uid),
		nrec_of_uid([uid]),
	])
	if (u === null) return null
	const uname = await idname(coll.user, u.referer)
	return { ...u, soc, uname, nrec }
}

export function user_set(
	uid: User["_id"],
	user: Partial<User>,
) {
	return coll.user.updateOne({ _id: uid }, { $set: user }, { upsert: true })
}

const utc_pass_valid = new Date("2022-10-05").getTime()
const utc_h = 60 * 60 * 1000
const utc_d = 24 * utc_h
export const pcode_expire_h = 1
export const pcode_digit = 6

export type UserPass = {
	uid: User["_id"],
	utc: User["utc"],
}

export async function userpass(
	jwt: string
): Promise<UserPass | null> {
	const u = await jwt_verify<UserPass>(jwt)
	if (u) {
		const p = await pass_of_uid(u.uid)
		if (p && p.pcode && p.pcode.utc > utc_pass_valid && p.ptoken && p.ptoken === jwt)
			return { uid: u.uid, utc: Date.now() }
	}
	return null
}
export async function userpass_issue(
	nbr: string,
	code: number,
	renew: boolean,
) {
	const p = await pass_of_nbr(nbr)
	const utc = Date.now()
	if (p && p.pcode && p.pcode.code === code && utc - p.pcode.utc < pcode_expire_h * utc_h) {
		const u: UserPass = { uid: p._id, utc }
		if (renew && p.ptoken) return { u, jwt: p.ptoken }
		const jwt = await jwt_sign(u)
		const { modifiedCount } = await coll.user.updateOne({ _id: u.uid }, { $set: { ptoken: jwt } })
		if (modifiedCount > 0) return { u, jwt }
	}
	return null
}
export const uid_tst = 100
export async function userpass_code(
	nbr: string,
	code: number,
	sms: boolean,
) {
	const p = await pass_of_nbr(nbr)
	const utc = Date.now()
	if (p && (!p.pcode || utc - p.pcode.utc > utc_d || code == p.pcode.code)) {
		code = p._id === uid_tst ? 111111 : Math.round(Math.random() * 1000000)
		const { modifiedCount } = await coll.user.updateOne({ _id: p._id }, { $set: { pcode: { code, utc } } })
		if (modifiedCount > 0 && sms) {
			const { sent } = await smssend(nbr, `${code}`.padStart(pcode_digit, "0"), `${pcode_expire_h}`)
			return { sent }
		} else if (modifiedCount > 0) return { sent: false }
	}
	return null
}


