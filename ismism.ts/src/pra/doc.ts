import { coll } from "../db.ts"
import { agd_r } from "../eid/agd.ts"
import { idnam } from "../eid/id.ts"
import { nrec } from "../eid/rec.ts"
import { sidnam, soc_r } from "../eid/soc.ts"
import { Agd, Soc, Usr } from "../eid/typ.ts"
import { usr_r } from "../eid/usr.ts"

const projid = { nam: 1, rej: 1, ref: 1, utc: 1, adm1: 1, adm2: 1, intro: 1 } as const

export async function usr(
	_id: Usr["_id"],
) {
	const [u, snam, nr] = await Promise.all([
		usr_r({ _id }, projid),
		sidnam(_id),
		nrec({ uid: [_id] })
	])
	if (!u) return null
	const unam = await idnam(coll.usr, [...u.rej, ...u.ref])
	return { ...u, unam, snam, nrec: nr }
}

export async function soc(
	_id: Soc["_id"]
) {
	const s = await soc_r(_id, { ...projid, sec: 1, uid_max: 1, uid: 1, res_max: 1, res: 1 })
	if (!s) return null
	const [unam, nr] = await Promise.all([
		idnam(coll.usr, [...s.rej, ...s.ref, ...s.sec, ...s.uid, ...s.res]),
		nrec({ uid: s.uid }),
	])
	return { ...s, unam, nrec: nr }
}

export async function agd(
	_id: Agd["_id"]
) {
	const a = await agd_r(_id, { ...projid, detail: 1, budget: 1, fund: 1, expense: 1, goal: 1, img: 1, res_max: 1 })
	if (!a) return null
	const [unam, nr] = await Promise.all([
		idnam(coll.usr, [...a.rej, ...a.ref]),
		nrec({ aid: _id }),
	])
	return { ...a, unam, nrec: nr }
}
