import { Coll } from "../db.ts"
import { Dat } from "../dbtyp.ts"

export async function dat<T extends Dat>(
	c: Coll<T>,
	_id?: Dat["_id"]
): Promise<T | undefined> {
	if (!_id) return undefined
	return await c.findOne({ _id }, { projection: { _id: 0 } })
}
