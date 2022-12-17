import { collrec, rec_of_aid, rec_of_recent, rec_of_sid, rec_of_uid } from "./db.ts"
import { agenda } from "./query/agenda.ts"
import { soc } from "./query/soc.ts"
import { user } from "./query/user.ts"

// deno-lint-ignore no-explicit-any
type Return<T extends (...args: any) => Promise<any>> = Awaited<ReturnType<T>>
export type Agenda = Return<typeof agenda>
export type User = Return<typeof user>
export type Soc = Return<typeof soc>

export async function query(
	q: string, p: URLSearchParams
) {
	switch (q) {
		case "agenda": {
			return await agenda()
		} case "user": {
			const uid = parseInt(p.get("uid") ?? "")
			return await user(uid)
		} case "soc": {
			const sid = parseInt(p.get("sid") ?? "")
			return await soc(sid)
		} case "rec_of_recent": {
			const coll = collrec(p.get("coll") ?? "")
			const utc = parseFloat(p.get("utc") ?? "")
			if (coll && utc > 0) return await rec_of_recent(coll, utc, 1000)
			break
		} case "rec_of_aid": {
			const coll = collrec(p.get("coll") ?? "")
			const aid = parseInt(p.get("aid") ?? "")
			if (coll && aid > 0) return await rec_of_aid(coll, aid)
			break
		} case "rec_of_uid": {
			const coll = collrec(p.get("coll") ?? "")
			const uid = parseInt(p.get("uid") ?? "")
			if (coll && uid > 0) return await rec_of_uid(coll, [uid])
			break
		} case "rec_of_sid": {
			const coll = collrec(p.get("coll") ?? "")
			const sid = parseInt(p.get("sid") ?? "")
			if (coll && sid > 0) return await rec_of_sid(coll, sid)
			break
		}
	}
	return null
}
