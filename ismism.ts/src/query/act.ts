import { coll } from "../db.ts"
import { Act } from "../dbtyp.ts"

export async function act(
	_id: string
) {
	const utc = Date.now()
	if (_id.length < 6) return null
	const a = await coll.act.findOne({ _id })
	if (a && (a.exp === 0 || utc < a.exp)) {
		await coll.act.updateOne({ _id }, { $set: { exp: utc } })
		return a
	}
	return null
}

export function act_new(
	d: Act
) {
	return coll.act.insertOne(d)
}
export function act_del(
	_id: string
) {
	return coll.act.deleteOne({ _id })
}
