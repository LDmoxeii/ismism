import { coll } from "../db.ts"

export function fund_of_uid(
	uid: number[]
) {
	return coll.fund.find({ uid: { $in: uid } }).toArray()
}

export async function nfund_of_aid(
	aid: number
) {
	if (aid === 0) return 0
	return await coll.fund.countDocuments({ "_id.aid": aid })
}
export async function fund_of_aid(
	aid: number
) {
	if (aid === 0) return []
	return await coll.fund.find({ "_id.aid": aid }).sort({ "_id.utc": -1 }).toArray()
}
