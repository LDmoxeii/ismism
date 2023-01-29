import { Aut, User } from "../eidetic/dbtyp.ts"
import { DocR, DocU } from "../db.ts"
import { jwt_sign, jwt_verify } from "../ontic/jwt.ts"
import { user_r, user_u } from "../eidetic/user.ts"
import { aut_r } from "../eidetic/aut.ts"
import { utc_h } from "../ontic/utc.ts"
import { smssend } from "../ontic/sms.ts"

export type Pass = {
	id: { uid: User["_id"], utc: number },
	name: User["name"],
	aut: Aut["p"],
}

const utc_pass_valid = new Date("2023-01-29").getTime()
const h_pcode_valid = 1
export const pcode_digit = 6

export async function pass(
	jwt: NonNullable<User["ptoken"]>
): DocR<Pass> {
	const id = await jwt_verify<Pass["id"]>(jwt)
	if (!id) return null
	const [u, aut] = await Promise.all([
		user_r({ _id: id.uid }, { name: 1, pcode: 1, ptoken: 1 }),
		aut_r(id.uid)
	])
	if (u && u.pcode && u.pcode.utc > utc_pass_valid && u.ptoken && u.ptoken === jwt)
		return { id, name: u.name, aut: aut ? aut.p : [] }
	return null
}

export async function pass_issue(
	nbr: NonNullable<User["nbr"]>,
	code: NonNullable<User["pcode"]>["code"],
): DocR<{ pass: Pass, jwt: NonNullable<User["ptoken"]> }> {
	const u = await user_r({ nbr }, { name: 1, pcode: 1, ptoken: 1 })
	const utc = Date.now()
	if (u && u.pcode && u.pcode.code === code && utc - u.pcode.utc < utc_h * h_pcode_valid) {
		const aut = await aut_r(u._id)
		const pass: Pass = {
			id: { uid: u._id, utc },
			name: u.name,
			aut: aut ? aut.p : [],
		}
		if (u.ptoken) return { pass, jwt: u.ptoken }
		const jwt = await jwt_sign(pass.id)
		const c = await user_u(u._id, { ptoken: jwt })
		if (c && c > 0) return { pass, jwt }
	}
	return null
}

export async function pass_code(
	nbr: NonNullable<User["nbr"]>,
	sms: boolean,
): DocR<{ sms: boolean, utc?: number }> {
	const u = await user_r({ nbr }, { name: 1, pcode: 1, ptoken: 1 })
	if (!u) return null
	const utc = Date.now()
	if (u.pcode && utc - u.pcode.utc < utc_h * h_pcode_valid)
		return { sms: false, utc: u.pcode.utc }
	const code = Math.round(Math.random() * 1000000)
	const c = await user_u(u._id, { pcode: { code, utc } })
	if (c && c > 0) {
		if (sms) {
			const { sent } = await smssend(nbr, `${code}`.padStart(pcode_digit, "0"), `${h_pcode_valid}`)
			return { sms: sent }
		}
		return { sms: false }
	}
	return null
}

export function pass_clear(
	uid: User["_id"]
): DocU {
	return user_u(uid, { ptoken: "" }, true)
}
