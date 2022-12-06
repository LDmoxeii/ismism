import { coll, not_id } from "../db.ts"

export async function dat_of_aid(
	aid: number
) {
	if (not_id(aid)) return null
	return await coll.dat.findOne(
		{ "_id.aid": aid },
		{
			sort: { "_id.utc": -1 },
			projection: { _id: 0 }
		}
	) ?? null
}
