import { coll, idname } from "../db.ts";
import { Soc } from "../typ.ts";
import { fund_of_uid } from "./fund.ts";
import { work_of_uid } from "./work.ts";

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
	const [work, fund] = await Promise.all([
		work_of_uid(s.uid),
		fund_of_uid(s.uid),
	])
	const [uidname, aidname] = await Promise.all([
		idname(coll.user, s.uid), idname(coll.agenda,
			work.map(w => w.aid).flat().concat(fund.map(f => f.aid))
		)])
	return { ...s, work, fund, uidname, aidname }
}
