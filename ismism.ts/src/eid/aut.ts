import type { Aut } from "./typ.ts"
import { coll, DocR, DocU, Updt } from "./db.ts"

export async function aut_r(
): DocR<Omit<Aut, "_id">> {
	return await coll.aut.findOne({ _id: 1 }, { projection: { _id: 0 } }) ?? null
}

export async function aut_u(
	u: Updt<Aut>,
): DocU {
	try {
		const { matchedCount, modifiedCount } = await coll.aut.updateOne({ _id: 1 }, u)
		if (matchedCount > 0) return modifiedCount > 0 ? 1 : 0
		else return null
	} catch { return null }
}
