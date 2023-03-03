import type { Agd, Rec, Soc, Usr } from "../eid/typ.ts"
import { Coll, coll } from "../db.ts"
import { rolref } from "../eid/rel.ts"
import { usr_r } from "../eid/usr.ts"
import { soc_r } from "../eid/soc.ts"
import { agd_r } from "../eid/agd.ts"
import { nrec, rec_f } from "../eid/rec.ts"
import { id, idnam, nid_of_adm } from "../eid/id.ts"

export async function nid(
) {
	const [adm1nsid, adm2nsid, adm1naid, adm2naid] = await Promise.all([
		nid_of_adm(coll.soc, "adm1"), nid_of_adm(coll.soc, "adm2"),
		nid_of_adm(coll.agd, "adm1"), nid_of_adm(coll.agd, "adm2"),
	])
	return { adm1nsid, adm2nsid, adm1naid, adm2naid }
}

const pid = { nam: 1, rej: 1, ref: 1, utc: 1, adm1: 1, adm2: 1, intro: 1 } as const
const prel = { sec: 1, uidlim: 1, uid: 1, reslim: 1, res: 1 } as const
const pagd = { account: 1, budget: 1, fund: 1, expense: 1, goal: 1, img: 1 } as const

export async function usr(
	_id: Usr["_id"]
) {
	const [u, urej, uref, sref, aref, nr] = await Promise.all([
		usr_r({ _id }, pid),
		id(coll.usr, { rej: _id }), id(coll.usr, { ref: _id }),
		rolref(coll.soc, _id), rolref(coll.agd, _id),
		nrec({ uid: [_id] }),
	])
	if (!u || !sref || !aref || !nr) return null
	const [unam, snam, anam] = await Promise.all([
		idnam(coll.usr, [...u.rej, ...u.ref, ...urej, ...uref]),
		idnam(coll.soc, Object.values(sref).flatMap(s => s.map(p => p[0]))),
		idnam(coll.agd, Object.values(aref).flatMap(s => s.map(p => p[0]))),
	])
	return { ...u, sref, aref, unam, snam, anam, nrec: nr }
}

export async function soc(
	_id: Soc["_id"]
) {
	const s = await soc_r(_id, { ...pid, ...prel })
	if (!s) return null
	const [unam, nr] = await Promise.all([
		idnam(coll.usr, [...s.rej, ...s.ref, ...s.sec, ...s.uid, ...s.res,]),
		nrec({ uid: s.uid }),
	])
	return { ...s, unam, nrec: nr }
}

export async function agd(
	_id: Agd["_id"]
) {
	const a = await agd_r(_id, { ...pid, ...prel, ...pagd })
	if (!a) return null
	const [unam, nr] = await Promise.all([
		idnam(coll.usr, [...a.rej, ...a.ref, ...a.sec, ...a.uid, ...a.res,]),
		nrec({ aid: a._id }),
	])
	return { ...a, unam, nrec: nr }
}

export async function rec<
	T extends Rec
>(
	c: Coll<T>,
	utc: T["_id"]["utc"],
	id?: { uid: T["_id"]["uid"] } | { aid: T["_id"]["aid"] } | { sid: Soc["_id"] }
) {
	let r = null
	if (!id) r = await rec_f(c, utc)
	else if ("uid" in id) r = await rec_f(c, utc, { uid: [id.uid] })
	else if ("aid" in id) { r = await rec_f(c, utc, id) }
	else {
		const s = await soc_r(id.sid, { uid: 1 })
		if (s) r = await rec_f(c, utc, { uid: s.uid })
	}
	if (r) {
		const [unam, anam] = await Promise.all([
			idnam(coll.usr, r.map(r => r._id.uid)),
			idnam(coll.usr, r.map(r => r._id.aid)),
		])
		return { rec: r, unam, anam }
	}
	return null
}
