import { coll, DocC, DocD, DocR, DocU, Update } from "../db.ts"
import { Aut } from "./dbtyp.ts"
import { not_id } from "./id.ts"

export async function aut_c(
	aut: Aut,
): DocC<Aut["_id"]> {
	if (not_id(aut._id)) return null
	try { return await coll.aut.insertOne(aut) as Aut["_id"] }
	catch { return null }
}

export async function aut_r(
	_id: Aut["_id"]
): DocR<Aut> {
	if (not_id(_id)) return null
	return await coll.aut.findOne({ _id }) ?? null
}

export async function aut_u(
	_id: Aut["_id"],
	u: Update<Aut>,
): DocU {
	if (not_id(_id)) return null
	try {
		const { modifiedCount } = await coll.aut.updateOne({ _id }, u)
		return modifiedCount > 0 ? 1 : 0
	} catch { return null }
}

export async function aut_d(
	_id: Aut["_id"]
): DocD {
	if (not_id(_id)) return null
	try {
		const d = await coll.aut.deleteOne({ _id })
		return d > 0 ? 1 : 0
	} catch { return null }
}
