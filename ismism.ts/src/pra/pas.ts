import type { Aut, Usr, Agd } from "../eid/typ.ts"
import { coll, DocR, DocU } from "../db.ts"
import { jwt_sign, jwt_verify } from "../ont/jwt.ts"
import { usr_r, usr_u } from "../eid/usr.ts"
import { aut_r } from "../eid/aut.ts"
import { utc_h } from "../ont/utc.ts"
import { smssend } from "../ont/sms.ts"
import { rol, Rol } from "../eid/rel.ts"
import { is_ptoken, len_code, lim_code, lim_dst, lim_rd } from "../eid/is.ts"
import { fund_f, work_n } from "../eid/rec.ts"
import { dst_f } from "../eid/dst.ts"

export type Pas = {
	uid: Usr["_id"],
	rej: Usr["rej"],
	ref: Usr["ref"],
	nam: Usr["nam"],
	aut: Aut["aut"],
	sid: Rol,
	aid: Rol,
	limdst: number,
	dst: Agd["_id"][],
}

function limdst(
	fund: number,
	work: number,
): number {
	const f = Math.round(0.5 * (fund + Math.floor(fund / 7)))
	const w = work >= 3 ? 4 : (work >= 1 ? 2 : 0)
	return Math.min(lim_dst, f + w)
}

async function pas_of_usr(
	u: Pick<Usr, "_id" | "nam" | "rej" | "ref">
): DocR<Pas> {
	const [aut, sid, aid, fund, work, dst] = await Promise.all([
		aut_r(u._id), rol(coll.soc, u._id), rol(coll.agd, u._id),
		fund_f({ rd: lim_rd, "_id.uid": u._id }), work_n(u._id), dst_f({ rd: lim_rd, uid: u._id })
	])
	if (!sid || !aid) return null
	return {
		uid: u._id,
		rej: u.rej, ref: u.ref,
		nam: u.nam,
		aut: aut ? aut.aut : [],
		sid, aid,
		limdst: limdst(fund.reduceRight((a, b) => a + b.unit, 0), work),
		dst: dst ? dst.map(d => d._id.aid!) : [],
	}
}

type Token = { uid: Usr["_id"], utc: number }

const utc_pas_valid = new Date("2023-02-03").getTime()
const h_pcode_valid = 1

export async function pas(
	jwt: NonNullable<Usr["ptoken"]>
): DocR<Pas> {
	if (!is_ptoken(jwt)) return null
	const token = await jwt_verify<Token>(jwt)
	if (!token) return null
	const u = await usr_r({ _id: token.uid }, { rej: 1, ref: 1, nam: 1, pcode: 1, ptoken: 1 })
	if (u && u.pcode && u.pcode.utc > utc_pas_valid && u.ptoken && u.ptoken === jwt)
		return pas_of_usr(u)
	return null
}

export async function pas_issue(
	nbr: NonNullable<Usr["nbr"]>,
	code: NonNullable<Usr["pcode"]>["code"],
): DocR<{ pas: Pas, jwt: NonNullable<Usr["ptoken"]> }> {
	const u = await usr_r({ nbr }, { rej: 1, ref: 1, nam: 1, pcode: 1, ptoken: 1 })
	const utc = Date.now()
	if (u && u.pcode && u.pcode.code === code && utc - u.pcode.utc < utc_h * h_pcode_valid) {
		const pas = await pas_of_usr(u)
		if (!pas) return null
		if (u.ptoken) return { pas, jwt: u.ptoken }
		const jwt = await jwt_sign({ uid: pas.uid, utc } as Token)
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
	const code = Math.round(Math.random() * lim_code)
	const c = await usr_u(u._id, { $set: { pcode: { code, utc } } })
	if (c && c > 0) {
		if (sms) {
			const { sent } = await smssend(nbr, `${code}`.padStart(len_code, "0"), `${h_pcode_valid}`)
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
