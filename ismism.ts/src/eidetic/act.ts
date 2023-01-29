import { coll, DocC, DocD, DocR, DocU } from "../db.ts"
import { Act } from "./dbtyp.ts"

function is_actid(
	id: Act["_id"]
): id is Act["_id"] {
	return id.length >= 6
}
function not_actid(
	id: Act["_id"]
) {
	return !is_actid(id)
}

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
	a: Partial<Act>,
): DocU {
	if (not_actid(_id)) return null
	try {
		const { modifiedCount } = await coll.act.updateOne({ _id }, { $set: a })
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
