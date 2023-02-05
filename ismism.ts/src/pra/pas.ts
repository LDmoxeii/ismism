import { Aut, Usr } from "../eid/typ.ts"
import { DocR, DocU } from "../db.ts"
import { jwt_sign, jwt_verify } from "../ont/jwt.ts"
import { usr_r, usr_u } from "../eid/usr.ts"
import { aut_r } from "../eid/aut.ts"
import { utc_h } from "../ont/utc.ts"
import { smssend } from "../ont/sms.ts"
import { Rol, rol } from "../eid/rec.ts"

export type Pas = {
	id: { uid: Usr["_id"], utc: number },
	rej: Usr["rej"],
	ref: Usr["ref"],
	nam: Usr["nam"],
	aut: Aut["p"],
	rol: Rol[0][1],
}

export function is_aut(
	pas: Pas,
	aut: Aut["p"][0],
): boolean {
	return pas.aut.includes(aut)
}
export function not_aut(
	pas: Pas,
	aut: Aut["p"][0],
) {
	return !is_aut(pas, aut)
}

const utc_pas_valid = new Date("2023-01-29").getTime()
const h_pcode_valid = 1
export const pcode_digit = 6

export async function pas(
	jwt: NonNullable<Usr["ptoken"]>
): DocR<Pas> {
	const id = await jwt_verify<Pas["id"]>(jwt)
	if (!id) return null
	const [u, aut, [r]] = await Promise.all([
		usr_r({ _id: id.uid }, { rej: 1, ref: 1, nam: 1, pcode: 1, ptoken: 1 }),
		aut_r(id.uid),
		rol([id.uid]),
	])
	if (u && u.pcode && u.pcode.utc > utc_pas_valid && u.ptoken && u.ptoken === jwt)
		return {
			id,
			rej: u.rej,
			ref: u.ref,
			nam: u.nam,
			aut: aut ? aut.p : [],
			rol: r && r[0] === id.uid ? r[1] : []
		}
	return null
}

export async function pas_issue(
	nbr: NonNullable<Usr["nbr"]>,
	code: NonNullable<Usr["pcode"]>["code"],
): DocR<{ pas: Pas, jwt: NonNullable<Usr["ptoken"]> }> {
	const u = await usr_r({ nbr }, { rej: 1, ref: 1, nam: 1, pcode: 1, ptoken: 1 })
	const utc = Date.now()
	if (u && u.pcode && u.pcode.code === code && utc - u.pcode.utc < utc_h * h_pcode_valid) {
		const [aut, [r]] = await Promise.all([
			aut_r(u._id),
			rol([u._id]),
		])
		const pas: Pas = {
			id: { uid: u._id, utc },
			rej: u.rej, ref: u.ref,
			nam: u.nam,
			aut: aut ? aut.p : [],
			rol: r && r[0] === u._id ? r[1] : []
		}
		if (u.ptoken) return { pas, jwt: u.ptoken }
		const jwt = await jwt_sign(pas.id)
		const c = await usr_u(u._id, { $set: { ptoken: jwt } })
		if (c && c > 0) return { pas, jwt }
	}
	return null
}

export async function pas_code(
	nbr: NonNullable<Usr["nbr"]>,
	sms: boolean,
): DocR<{ sms: boolean, utc?: number }> {
	const u = await usr_r({ nbr }, { nam: 1, pcode: 1, ptoken: 1 })
	if (!u) return null
	const utc = Date.now()
	if (u.pcode && utc - u.pcode.utc < utc_h * h_pcode_valid)
		return { sms: false, utc: u.pcode.utc }
	const code = Math.round(Math.random() * 1000000)
	const c = await usr_u(u._id, { $set: { pcode: { code, utc } } })
	if (c && c > 0) {
		if (sms) {
			const { sent } = await smssend(nbr, `${code}`.padStart(pcode_digit, "0"), `${h_pcode_valid}`)
			return { sms: sent }
		}
		return { sms: false }
	}
	return null
}

export function pas_clear(
	uid: Usr["_id"]
): DocU {
	return usr_u(uid, { $unset: { ptoken: "" } })
}
