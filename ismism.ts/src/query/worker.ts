import { coll } from "../db.ts"

export function worker_of_uid(
	uid: number[]
) {
	return coll.worker.find({ uid: { $in: uid } }).toArray()
}

export async function nworker_of_aid(
	aid: number
) {
	if (aid === 0) return 0
	return await coll.worker.countDocuments({ aid })
}
export async function worker_of_aid(
	aid: number
) {
	if (aid === 0) return []
	return await coll.worker.find({ aid }).sort({ utc: -1 }).toArray()
}
