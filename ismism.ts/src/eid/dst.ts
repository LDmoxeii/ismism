import type { Agd, Dst, Usr } from "./typ.ts"
import { DocC, DocD, DocR, DocU, coll } from "../db.ts"
import { is_dstid, is_id, is_json, is_lim, lim_rd } from "./is.ts"

export async function dst_c(
	dst: Dst
): DocC<Dst["_id"]> {
	if (!is_dstid(dst._id) || "json" in dst && !is_json(dst.json!)) return null
	try { return await coll.dst.insertOne(dst) as Dst["_id"] }
	catch { return null }
}

export async function dst_r(
	_id: Dst["_id"]
): DocR<Dst> {
	if (!is_dstid(_id)) return null
	return await coll.dst.findOne({ _id }) ?? null
}

export async function dst_f(
	_id: { rd: Dst["_id"]["rd"], uid?: Usr["_id"] }
) {
	if (!is_lim(_id.rd, lim_rd) || "uid" in _id && !is_id(_id.uid!)) return null
	const f = {
		"_id.rd": _id.rd,
		..."uid" in _id ? { "_id.uid": _id.uid } : { "_id.aid": { $exists: true }, "_id.uid": { $exists: false } },
	}
	return await coll.dst.find(f).toArray()
}

export async function dst_n(
	_id: { rd: Dst["_id"]["rd"] } & ({ aid: Agd["_id"] } | { uid: Agd["_id"] })
): DocR<number> {
	const f = {
		"_id.rd": _id.rd,
		..."aid" in _id ? { "_id.aid": _id.aid, "_id.uid": { $exists: true } } : {},
		..."uid" in _id ? { "_id.uid": _id.uid } : {},
	}
	return is_lim(_id.rd, lim_rd)
		? (await coll.dst.find(f).toArray()).reduceRight((a, b) => a + (b.dst ?? 1), 0)
		: null
}

export async function dst_a(
	_id: Dst["_id"]
): DocU {
	const d = await dst_r(_id)
	try {
		if (d && (d.dst ? d.dst : 1) <= 4) {
			const { matchedCount, modifiedCount } = await coll.dst.updateOne({ _id }, { $inc: { dst: d.dst ? 1 : 2 } })
			if (matchedCount > 0) return modifiedCount > 0 ? 1 : 0
			else return null
		} else return await dst_c({ _id, dst: 1 }) ? 1 : null
	} catch { return null }
}

export async function dst_u(
	rd: Dst["_id"]["rd"],
	json: NonNullable<Dst["json"]>,
): DocU {
	if (!is_dstid({ rd }) || !is_json(json)) return null
	try {
		// deno-lint-ignore no-explicit-any
		const { matchedCount, modifiedCount } = await coll.dst.updateOne({ _id: { rd } } as any, { $set: { json } })
		if (matchedCount > 0) return modifiedCount > 0 ? 1 : 0
		else return null
	} catch { return null }
}

export async function dst_d(
	_id: { rd: Dst["_id"]["rd"], uid: Usr["_id"] }
): DocD {
	if (!is_lim(_id.rd, lim_rd) || !is_id(_id.uid)) return null
	try {
		const d = await coll.dst.deleteMany({ "_id.rd": _id.rd, "_id.uid": _id.uid })
		return d > 0 ? 1 : 0
	} catch { return null }
}
