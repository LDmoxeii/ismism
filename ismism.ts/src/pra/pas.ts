import type { Aut, Usr, Soc } from "../eid/typ.ts"
import { coll, DocR, DocU } from "../eid/db.ts"
import { jwt_sign, jwt_verify } from "../ont/jwt.ts"
import { usr_r, usr_u } from "../eid/usr.ts"
import { aut_r } from "../eid/aut.ts"
import { utc_h } from "../ont/utc.ts"
import { smssend } from "../ont/sms.ts"
import { is_id, is_jwt, len_code, lim_code } from "../eid/is.ts"
import { rec_a } from "../eid/rec.ts"
import { id } from "../eid/id.ts";

export type Pas = {
	usr: Usr["_id"],
	nam: Usr["nam"],
	cdt: Soc["_id"][],
	sec: Soc["_id"][],
	aut: Aut["aut"],
}

async function pas_of_usr(
	u: Pick<Usr, "_id" | "nam">
): DocR<Pas> {
	if (!is_id(u._id)) return null
	const [cdt, sec, aut] = await Promise.all([
		rec_a(coll.cdt, u._id, Date.now()), // deno-lint-ignore no-explicit-any
		id(coll.soc, { sec: u._id } as any),
		aut_r(u._id),
	])
	return {
		usr: u._id, nam: u.nam,
		cdt, sec, aut: aut ? aut.aut : [],
	}
}

type Token = { usr: Usr["_id"], utc: number }

const utc_pas_valid = new Date("2023-10-1").getTime()
const h_sms_valid = 1

export async function pas(
	jwt: NonNullable<Usr["jwt"]>
): DocR<Pas> {
	if (!is_jwt(jwt)) return null
	const t = await jwt_verify<Token>(jwt)
	if (!t) return null
	const u = await usr_r({ _id: t.usr }, { nam: 1, sms: 1, jwt: 1 })
	if (u && u.sms && u.sms.utc > utc_pas_valid && u.jwt === jwt)
		return pas_of_usr(u)
	return null
}

export async function pas_issue(
	nbr: NonNullable<Usr["nbr"]>,
	code: NonNullable<Usr["sms"]>["code"],
): DocR<{ pas: Pas, jwt: NonNullable<Usr["jwt"]> }> {
	const u = await usr_r({ nbr }, { nam: 1, sms: 1, jwt: 1 })
	const utc = Date.now()
	if (u && u.sms && u.sms.code === code && utc - u.sms.utc < utc_h * h_sms_valid) {
		const pas = await pas_of_usr(u)
		if (!pas) return null
		if (u.jwt) return { pas, jwt: u.jwt }
		const jwt = await jwt_sign({ usr: pas.usr, utc } as Token)
		const c = await usr_u(u._id, { $set: { ptoken: jwt } })
		if (c && c > 0) return { pas, jwt }
	}
	return null
}

export async function pas_code(
	nbr: NonNullable<Usr["nbr"]>,
	sms: boolean,
): DocR<{ sms: boolean, utc?: number }> {
	const u = await usr_r({ nbr }, { nam: 1, sms: 1, jwt: 1 })
	if (!u) return null
	const utc = Date.now()
	if (u.sms && utc - u.sms.utc < utc_h * h_sms_valid)
		return { sms: false, utc: u.sms.utc }
	const code = Math.round(Math.random() * lim_code)
	const c = await usr_u(u._id, { $set: { pcode: { code, utc } } })
	if (c && c > 0) {
		if (sms) {
			const { sent } = await smssend(nbr, `${code}`.padStart(len_code, "0"), `${h_sms_valid}`)
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
