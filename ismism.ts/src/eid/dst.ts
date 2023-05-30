import type { Agd, Dst } from "./typ.ts"
import { DocC, DocR, DocU, coll } from "../db.ts"
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
	_id: { rd: Dst["_id"]["rd"], uid?: Agd["_id"] }
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
	return is_lim(_id.rd, lim_rd) ? await coll.dst.countDocuments(f) : null
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
