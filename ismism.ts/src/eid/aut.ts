import type { Aut } from "./typ.ts"
import { coll, DocC, DocD, DocR, DocU, Update } from "../db.ts"
import { is_id } from "./is.ts"

export async function aut_c(
	aut: Aut,
): DocC<Aut["_id"]> {
	if (!is_id(aut._id)) return null
	try { return await coll.aut.insertOne(aut) as Aut["_id"] }
	catch { return null }
}

export async function aut_r(
	_id: Aut["_id"]
): DocR<Aut> {
	if (!is_id(_id)) return null
	return await coll.aut.findOne({ _id }) ?? null
}

export async function aut_u(
	_id: Aut["_id"],
	u: Update<Aut>,
): DocU {
	if (!is_id(_id)) return null
	try {
		const { matchedCount, modifiedCount } = await coll.aut.updateOne({ _id }, u)
		if (matchedCount > 0) return modifiedCount > 0 ? 1 : 0
		else return null
	} catch { return null }
}

export async function aut_d(
	_id: Aut["_id"]
): DocD {
	if (!is_id(_id)) return null
	try {
		const d = await coll.aut.deleteOne({ _id })
		return d > 0 ? 1 : 0
	} catch { return null }
}

