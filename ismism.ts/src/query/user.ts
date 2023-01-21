import { jwt_sign, jwt_verify } from "../ontic/jwt.ts"
import { coll, DocC, DocD, DocR, DocU } from "../db.ts"
import { User } from "../dbtyp.ts"
import { smssend, not_nbr, is_nbr } from "../ontic/sms.ts"
import { idname, is_id, not_id } from "./id.ts"
import { nrec_of_uid } from "./rec.ts"
import { soc_of_uid } from "./soc.ts"
import { act } from "./act.ts"

async function user_create(
	nbr: NonNullable<User["nbr"]>,
	referer: User["referer"],
): DocC<User["_id"]> {
	if (not_nbr(nbr)) return null
	const l = await coll.user.findOne({}, { projection: { _id: 1 }, sort: { _id: -1 } })
	if (!l) return null
	const _id = l._id + 1
	const u: User = {
		_id, nbr, referer,
		name: `${_id}`,
		utc: Date.now(),
		intro: "",
	}
	try { return await coll.user.insertOne(u) as User["_id"] }
	catch { return null }
}
async function user_read<
	P extends keyof User
>(
	f: { _id: User["_id"] } | { nbr: NonNullable<User["nbr"]> },
	projection: Partial<{ [K in P]: 0 | 1 }>
): DocR<Pick<User, P>> {
	if (!("_id" in f && is_id(f._id) || "nbr" in f && is_nbr(f.nbr))) return null
	return await coll.user.findOne(f, { projection }) ?? null
}
async function user_update(
	uid: User["_id"],
	user: Partial<User>,
	unset = false
): DocU {
	if (not_id(uid)) return null
	if (user.nbr && not_nbr(user.nbr)) return null
	try {
		const { modifiedCount } = await coll.user.updateOne(
			{ _id: uid }, unset ? { $unset: user } : { $set: user }
		)
		return modifiedCount > 0 ? 1 : 0
	} catch { return null }
}
export async function user_delete(
	f: { _id: User["_id"] } | { nbr: NonNullable<User["nbr"]> },
): DocD {
	if (!("_id" in f && is_id(f._id) || "nbr" in f && is_nbr(f.nbr))) return null
	try {
		const c = await coll.user.deleteOne(f)
		return c > 0 ? 1 : 0
	} catch { return null }
}

export async function user_new(
	actid: string, nbr: string
) {
	const a = await act(actid)
	if (a) switch (a.act) {
		case "usernew": { return user_create(nbr, a.referer) }
		case "usernbr": { return user_update(a.uid, { nbr }) }
	}
}

export async function user(
	uid: number
) {
	const [u, soc, nrec] = await Promise.all([
		user_read({ _id: uid }, { _id: 0, name: 1, utc: 1, referer: 1, intro: 1 }),
		soc_of_uid(uid),
		nrec_of_uid([uid]),
	])
	if (u === null) return null
	const uname = await idname(coll.user, u.referer)
	return { ...u, soc, uname, nrec }
}

const utc_pass_valid = new Date("2022-10-05").getTime()
const utc_h = 60 * 60 * 1000
export const pcode_expire_h = 1
export const pcode_digit = 6

export type UserPass = {
	uid: User["_id"],
	utc: User["utc"],
}

export async function userpass(
	jwt: string
): DocR<UserPass> {
	const u = await jwt_verify<UserPass>(jwt)
	if (u) {
		const p = await user_read({ _id: u.uid }, { _id: 0, name: 1, pcode: 1, ptoken: 1 })
		if (p && p.pcode && p.pcode.utc > utc_pass_valid && p.ptoken && p.ptoken === jwt)
			return { uid: u.uid, utc: Date.now() }
	}
	return null
}
export function userpass_clear(
	uid: number
) {
	return user_update(uid, { ptoken: "" }, true)
}
export async function userpass_issue(
	nbr: string,
	code: number,
	renew: boolean,
) {
	const p = await user_read({ nbr }, { _id: 0, name: 1, pcode: 1, ptoken: 1 })
	const utc = Date.now()
	if (p && p.pcode && p.pcode.code === code && utc - p.pcode.utc < pcode_expire_h * utc_h) {
		const u: UserPass = { uid: p._id, utc }
		if (renew && p.ptoken) return { u, jwt: p.ptoken }
		const jwt = await jwt_sign(u)
		const c = await user_update(u.uid, { ptoken: jwt })
		if (c && c > 0) return { u, jwt }
	}
	return null
}
export const uid_tst = 100
export async function userpass_code(
	nbr: string,
	sms: boolean,
) {
	const p = await user_read({ nbr }, { _id: 0, name: 1, pcode: 1, ptoken: 1 })
	const utc = Date.now()
	if (p) {
		if (p.pcode && utc - p.pcode.utc < pcode_expire_h * utc_h) return { sent: false, utc: p.pcode.utc }
		const code = p._id === uid_tst ? 111111 : Math.round(Math.random() * 1000000)
		const c = await user_update(p._id, { pcode: { code, utc } })
		if (c && c > 0 && sms) {
			const { sent } = await smssend(nbr, `${code}`.padStart(pcode_digit, "0"), `${pcode_expire_h}`)
			return { sent }
		} else if (c && c > 0) return { sent: false }
	}
	return null
}
