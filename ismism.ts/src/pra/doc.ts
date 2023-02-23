import { coll } from "../db.ts"
import { agd_r } from "../eid/agd.ts"
import { idnam, id_of_uid } from "../eid/id.ts"
import { nrec } from "../eid/rec.ts"
import { soc_r } from "../eid/soc.ts"
import { Agd, Soc, Usr } from "../eid/typ.ts"
import { usr_r } from "../eid/usr.ts"

const pid = { nam: 1, rej: 1, ref: 1, utc: 1, adm1: 1, adm2: 1, intro: 1 } as const
const psoc = { sec: 1, reslim: 1, res: 1, uidlim: 1, uid: 1 } as const

export async function usr(
	_id: Usr["_id"],
) {
	const [u, sid, aid, nr] = await Promise.all([
		usr_r({ _id }, pid),
		id_of_uid(coll.soc, _id), id_of_uid(coll.agd, _id),
		nrec({ uid: [_id] })
	])
	if (!u) return null
	const [unam, snam, anam] = await Promise.all([
		idnam(coll.usr, [...u.rej, ...u.ref]),
		idnam(coll.soc, Object.values(sid).flat()),
		idnam(coll.agd, Object.values(aid).flat()),
	])
	return {
		...u, sid, aid, unam, snam, anam, nrec: nr
	}
}

export async function soc(
	_id: Soc["_id"]
) {
	const s = await soc_r(_id, { ...pid, ...psoc })
	if (!s) return null
	const [unam, nr] = await Promise.all([
		idnam(coll.usr, [...s.rej, ...s.ref, ...s.sec, ...s.res, ...s.uid]),
		nrec({ uid: s.uid }),
	])
	return { ...s, unam, nrec: nr }
}

export async function agd(
	_id: Agd["_id"]
) {
	const a = await agd_r(_id, { ...pid, ...psoc, detail: 1, budget: 1, fund: 1, expense: 1, goal: 1, img: 1 })
	if (!a) return null
	const [unam, nr] = await Promise.all([
		idnam(coll.usr, [...a.rej, ...a.ref, ...a.sec, ...a.res, ...a.uid]),
		nrec({ aid: _id }),
	])
	return { ...a, unam, nrec: nr }
}
