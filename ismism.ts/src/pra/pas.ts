import type { Usr, Soc, Aut, Agd } from "../eid/typ.ts"
import type { PasPos } from "./pos.ts"
import { coll, DocR, DocU } from "../eid/db.ts"
import { jwt_sign, jwt_verify } from "../ont/jwt.ts"
import { usr_r, usr_u } from "../eid/usr.ts"
import { utc_h } from "../ont/utc.ts"
import { smssend } from "../ont/sms.ts"
import { is_id, is_jwt, len_code, lim_code } from "../eid/is.ts"
import { cdt_f } from "../eid/rec.ts"
import { id } from "../eid/id.ts"
import { aut_r } from "../eid/aut.ts"
import { soc_r } from "../eid/soc.ts"
import { Ret, is_psg } from "./can.ts"

export type Pas = {
	usr: Usr["_id"],
	nam: Usr["nam"],
	cdt: Soc["_id"][],
	agr: Soc["_id"][],
	sec: Soc["_id"][],
	agd: Agd["_id"][],
	aut: Omit<Aut, "_id">,
}

async function pas_of_usr(
	u: Pick<Usr, "_id" | "nam">
): DocR<Pas> {
	if (!is_id(u._id)) return null
	const [cdt, sec, aut] = await Promise.all([
		cdt_f({ usr: u._id }, { now: Date.now() }, { _id: 1, utc: 1 }), // deno-lint-ignore no-explicit-any
		id(coll.soc, { sec: u._id } as any),
		aut_r()
	])
	const [soc, agd] = await Promise.all([ // deno-lint-ignore no-explicit-any
		cdt ? Promise.all(cdt.map(c => soc_r(c._id.soc, { _id: 1, agr: 1 } as any))) : [],
		id(coll.agd, { soc: { $in: sec } }),
	])
	return aut ? {
		usr: u._id, nam: u.nam,
		cdt: cdt ? cdt.map(c => c._id.soc) : [],
		agr: cdt ? cdt.filter((c, n) => {
			const s = soc ? soc[n] : null
			return s && s.agr.msg.length > 0 && c.utc.agr < s.agr.utc
		}).map((_, n) => soc[n]!._id) : [],
		sec, agd, aut,
	} : null
}

type Jwt = { usr: Usr["_id"], utc: number }

const utc_pas_valid = new Date("2023-10-1").getTime()
const h_sms_valid = 1

export async function pas(
	jwt: NonNullable<Usr["jwt"]>
): DocR<Pas> {
	if (!is_jwt(jwt)) return null
	const t = await jwt_verify<Jwt>(jwt)
	if (!t) return null
	const u = await usr_r({ _id: t.usr }, { nam: 1, sms: 1, jwt: 1 })
	if (u && u.sms && u.sms.utc > utc_pas_valid && u.jwt === jwt)
		return pas_of_usr(u)
	return null
}

export type Psg = {
	psg: "pas",
} | {
	psg: "sms",
	nbr: NonNullable<Usr["nbr"]>,
	sms: boolean,
} | {
	psg: "code",
	nbr: NonNullable<Usr["nbr"]>,
	code: NonNullable<Usr["sms"]>["code"],
} | {
	psg: "clr",
	usr: Usr["_id"],
}
export type PsgRet = {
	pas: PasPos["pas"],
	sms: Ret<typeof pas_sms>,
	code: PasPos["pas"],
	clr: Ret<typeof pas_clr>,
}

async function pas_code(
	nbr: NonNullable<Usr["nbr"]>,
	code: NonNullable<Usr["sms"]>["code"],
): DocR<{ pas: Pas, jwt: NonNullable<Usr["jwt"]> }> {
	const u = await usr_r({ nbr }, { nam: 1, sms: 1, jwt: 1 })
	const utc = Date.now()
	if (u && u.sms && u.sms.code === code && utc - u.sms.utc < utc_h * h_sms_valid) {
		const pas = await pas_of_usr(u)
		if (!pas) return null
		if (u.jwt) return { pas, jwt: u.jwt }
		const jwt = await jwt_sign({ usr: pas.usr, utc } as Jwt)
		const c = await usr_u(u._id, { $set: { jwt } })
		if (c && c > 0) return { pas, jwt }
	}
	return null
}

async function pas_sms(
	nbr: NonNullable<Usr["nbr"]>,
	sms: boolean,
): DocR<{ sms: boolean, utc?: number }> {
	const u = await usr_r({ nbr }, { nam: 1, sms: 1, jwt: 1 })
	if (!u) return null
	const utc = Date.now()
	if (u.sms && utc - u.sms.utc < utc_h * h_sms_valid)
		return { sms: false, utc: u.sms.utc }
	const code = Math.round(Math.random() * lim_code)
	const c = await usr_u(u._id, { $set: { sms: { code, utc } } })
	if (c && c > 0) {
		if (sms) {
			const { sent } = await smssend(nbr, `${code}`.padStart(len_code, "0"), `${h_sms_valid}`)
			return { sms: sent }
		}
		return { sms: false }
	}
	return null
}

function pas_clr(
	usr: Usr["_id"]
): DocU {
	return usr_u(usr, { $unset: { jwt: "" } })
}

export async function psg(
	pos: PasPos,
	p: Psg,
) {
	if (!is_psg(p)) return null
	switch (p.psg) {
		case "pas": { return pos.pas }
		case "sms": { return pas_sms(p.nbr, p.sms) }
		case "code": {
			const r = await pas_code(p.nbr, p.code)
			if (!r) return null
			pos.jwt = r.jwt
			pos.pas = r.pas
			return pos.pas
		} case "clr": {
			const r = pos.pas && pos.pas.usr == p.usr ? pas_clr(p.usr) : null
			pos.pas = pos.jwt = null
			return r
		}
	}
	return null
}
