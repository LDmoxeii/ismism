import { coll } from "../db.ts"

export async function dat_of_aid(
	aid: number
) {
	if (aid === 0) return null
	return await coll.dat.findOne(
		{ "_id.aid": aid },
		{
			sort: { "_id.utc": -1 },
			projection: { _id: 0 }
		}
	) ?? null
}
