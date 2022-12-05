import { CollRec, coll_rec, rec_of_aid, rec_of_recent, rec_of_sid, rec_of_uid } from "../db.ts"
import { agenda } from "./agenda.ts"
import { recent } from "./recent.ts"
import { soc } from "./soc.ts"
import { user } from "./user.ts"

export type Query = {
	query: "recent"
} | {
	query: "agenda",
} | {
	query: "user",
	uid: number,
} | {
	query: "soc",
	sid: number,
} | {
	query: "rec_of_recent",
	coll: CollRec,
	utc: number,
} | {
	query: "rec_of_aid",
	coll: CollRec,
	aid: number,
} | {
	query: "rec_of_uid",
	coll: CollRec,
	uid: number,
} | {
	query: "rec_of_sid",
	coll: CollRec,
	sid: number,
}

// deno-lint-ignore no-explicit-any
export type Return<T extends (...args: any) => Promise<any>> = Awaited<ReturnType<T>>

export async function query(
	q: Query
) {
	switch (q.query) {
		case "recent": {
			return await recent()
		} case "agenda": {
			return await agenda()
		} case "user": {
			if (typeof q.uid == "number") return await user(q.uid)
			break
		} case "soc": {
			if (typeof q.sid == "number") return await soc(q.sid)
			break
		} case "rec_of_recent": {
			const c = coll_rec(q.coll)
			if (c && typeof q.utc == "number") return await rec_of_recent(c, q.utc, 10)
			break
		} case "rec_of_aid": {
			const c = coll_rec(q.coll)
			if (c && typeof q.aid == "number") return await rec_of_aid(c, q.aid)
			break
		} case "rec_of_uid": {
			const c = coll_rec(q.coll)
			if (c && typeof q.uid == "number") return await rec_of_uid(c, [q.uid])
			break
		} case "rec_of_sid": {
			const c = coll_rec(q.coll)
			if (c && typeof q.sid == "number") return await rec_of_sid(c, q.sid)
			break
		}
	}
	return null
}
