import type { Agd, Md, Rec, Soc, Usr, Work } from "../eid/typ.ts"
import { Coll, coll } from "../db.ts"
import { rolref } from "../eid/rel.ts"
import { usr_r } from "../eid/usr.ts"
import { soc_r } from "../eid/soc.ts"
import { agd_r } from "../eid/agd.ts"
import { nrec, nrec_d30, rec_f, rec_r } from "../eid/rec.ts"
import { id, idnam, nid_of_adm } from "../eid/id.ts"
import { aut_g, aut_r } from "../eid/aut.ts"
import { md_f, md_r } from "../eid/md.ts"

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
	const [u, aut, urej, uref, sref, aref, nrecd30, nr] = await Promise.all([
		usr_r({ _id }, pid), aut_r(_id),
		id(coll.usr, { rej: _id }), id(coll.usr, { ref: _id }),
		rolref(coll.soc, _id), rolref(coll.agd, _id),
		nrec_d30(coll.work, { uid: [_id] }), nrec({ uid: [_id] }),
	])
	if (!u || !sref || !aref || !nr) return null
	const [unam, snam, anam] = await Promise.all([
		idnam(coll.usr, [...u.rej, ...u.ref, ...urej, ...uref]),
		idnam(coll.soc, Object.values(sref).flatMap(s => s.map(p => p[0]))),
		idnam(coll.agd, Object.values(aref).flatMap(s => s.map(p => p[0]))),
	])
	return { ...u, aut: aut ? aut.aut : [], urej, uref, sref, aref, unam, snam, anam, nrecd30, nrec: nr }
}

export async function soc(
	_id: Soc["_id"]
) {
	const s = await soc_r(_id, { ...pid, ...prel })
	if (!s) return null
	const [unam, nrecd30, nr] = await Promise.all([
		idnam(coll.usr, [...s.sec, ...s.uid, ...s.res,]),
		nrec_d30(coll.work, { uid: s.uid }), nrec({ uid: s.uid }),
	])
	if (!nr) return null
	return { ...s, unam, nrecd30, nrec: nr }
}

export async function agd(
	_id: Agd["_id"]
) {
	const a = await agd_r(_id, { ...pid, ...prel, ...pagd })
	if (!a) return null
	const [unam, nrecd30, nr] = await Promise.all([
		idnam(coll.usr, [...a.sec, ...a.uid, ...a.res,]),
		nrec_d30(coll.work, { aid: a._id }), nrec({ aid: a._id }),
	])
	if (!nr) return null
	return { ...a, unam, nrecd30, nrec: nr }
}

export async function rec<
	T extends Rec
>(
	c: Coll<T>,
	utc: T["_id"]["utc"],
	id?: { uid: T["_id"]["uid"] } | { aid: T["_id"]["aid"] } | { sid: Soc["_id"] }
		| { uid: T["_id"]["uid"], aid: T["_id"]["aid"] }
) {
	let r = null
	if (!id) r = await rec_f(c, utc)
	else if ("uid" in id && "aid" in id) {
		r = await rec_r(c, { ...id, utc })
		if (!r) return null
		r = [r]
	} else if ("uid" in id) r = await rec_f(c, utc, { uid: [id.uid] })
	else if ("aid" in id) { r = await rec_f(c, utc, id) }
	else {
		const s = await soc_r(id.sid, { uid: 1 })
		if (s) r = await rec_f(c, utc, { uid: s.uid })
	}
	if (r) {
		const uid = r.map(r => r._id.uid) // deno-lint-ignore no-explicit-any
		if ((c as any) === coll.work) uid.push(...(r as any as Work[]).flatMap(r => [...r.rej, ...r.ref]))
		const [unam, anam] = await Promise.all([
			idnam(coll.usr, uid),
			idnam(coll.agd, r.map(r => r._id.aid)),
		])
		return { rec: r, unam, anam }
	}
	return null
}

export async function aut(
) {
	const a = await aut_g()
	return { aut: a, unam: await idnam(coll.usr, Object.values(a).flat()) }
}

export async function md(
	c: Coll<Md>,
	id: Md["_id"],
	f: boolean,
) {
	let md
	if (f) md = await md_f(c, id)
	else {
		const r = await md_r(c, id)
		md = r ? [r] : null
	}
	if (!md) return null
	const unam = await idnam(coll.usr, md.map(m => m.uid))
	return { md, unam }
}
