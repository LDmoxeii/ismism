import { coll } from "../db.ts"

export function work_of_uid(
	uid: number[]
) {
	return coll.work.find({ uid: { $in: uid } }).toArray()
}

export async function nwork_of_aid(
	aid: number
) {
	if (aid === 0) return 0
	return await coll.work.countDocuments({ aid })
}
export async function work_of_aid(
	aid: number
) {
	if (aid === 0) return []
	return await coll.work.find({ aid }).sort({ utc: -1 }).toArray()
}
