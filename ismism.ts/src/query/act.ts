import { coll } from "../db.ts"
import { Act } from "../dbtyp.ts"

export async function act(
	_id: string
): Promise<Act | null> {
	const utc = Date.now()
	if (_id.length < 6) return null
	const a = await coll.act.findOne({ _id })
	if (a && (a.exp === 0 || utc < a.exp)) try {
		const { modifiedCount } = await coll.act.updateOne({ _id }, { $set: { exp: utc } })
		return modifiedCount > 0 ? a : null
	} catch { return null }
	return null
}
export async function act_new(
	d: Act
): Promise<Act["_id"] | null> {
	try {
		return await coll.act.insertOne(d) as Act["_id"]
	} catch { return null }
}
export async function act_del(
	_id: string
): Promise<0 | 1 | null> {
	try {
		const c = await coll.act.deleteOne({ _id })
		return c > 0 ? 1 : 0
	} catch { return null }
}
