import { coll, idname } from "../db.ts"
import { Soc } from "../typ.ts"
import { fund_of_uid } from "./fund.ts"
import { work_of_uid } from "./work.ts"
import { worker_of_uid } from "./worker.ts"

async function soc_of_sid(
	sid: number
): Promise<Omit<Soc, "_id"> | null> {
	if (sid === 0) return null
	const projection = { _id: 0 }
	return await coll.soc.findOne({ _id: sid }, { projection }) ?? null
}

export async function soc_of_uid(
	uid: number
): Promise<Pick<Soc, "_id" | "name">[]> {
	if (uid === 0) return []
	return await coll.soc.find(
		// deno-lint-ignore no-explicit-any
		{ uid } as any,
		{ projection: { _id: 1, name: 1 } }
	).toArray()
}

export async function soc(
	sid: number
) {
	if (sid === 0) return null
	const s = await soc_of_sid(sid)
	if (s === null) return null
	const [worker, work, fund] = await Promise.all([
		worker_of_uid(s.uid),
		work_of_uid(s.uid),
		fund_of_uid(s.uid),
	])
	const [uname, aname] = await Promise.all([
		idname(coll.user, s.uid), idname(coll.agenda, [
			...worker.map(w => w._id.aid),
			...work.map(w => w._id.aid),
			...fund.map(f => f._id.aid),
		])])
	return { ...s, worker, work, fund, uname, aname }
}
