import { coll, DocC, DocD, DocR, DocU, Update } from "../db.ts"
import { not_actid } from "./is.ts"
import { Act } from "./typ.ts"

export async function act_c(
	act: Act,
): DocC<Act["_id"]> {
	if (not_actid(act._id)) return null
	try { return await coll.act.insertOne(act) as Act["_id"] }
	catch { return null }
}

export async function act_r(
	_id: Act["_id"]
): DocR<Act> {
	if (not_actid(_id)) return null
	const a = await coll.act.findOne({ _id })
	if (a && a.exp > Date.now()) return a
	return null
}

export async function act_u(
	_id: Act["_id"],
	u: Update<Act>,
): DocU {
	if (not_actid(_id)) return null
	try {
		const { modifiedCount } = await coll.act.updateOne({ _id }, u)
		return modifiedCount > 0 ? 1 : 0
	} catch { return null }
}

export async function act_d(
	_id: Act["_id"]
): DocD {
	if (not_actid(_id)) return null
	try {
		const d = await coll.act.deleteOne({ _id })
		return d > 0 ? 1 : 0
	} catch { return null }
}
