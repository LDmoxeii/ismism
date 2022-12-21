import { nrec_of_uid } from "./rec.ts"
import { Soc } from "../dbtyp.ts"
import { idname, not_id } from "./id.ts"
import { coll } from "../db.ts"

async function soc_of_sid(
	sid: number
): Promise<Omit<Soc, "_id"> | null> {
	if (not_id(sid)) return null
	const projection = { _id: 0 }
	return await coll.soc.findOne({ _id: sid }, { projection }) ?? null
}

export async function soc_of_uid(
	uid: number
): Promise<Pick<Soc, "_id" | "name">[]> {
	if (not_id(uid)) return []
	return await coll.soc.find(
		// deno-lint-ignore no-explicit-any
		{ uid } as any,
		{ projection: { _id: 1, name: 1 } }
	).toArray()
}

export async function soc(
	sid: number
) {
	if (not_id(sid)) return null
	const s = await soc_of_sid(sid)
	if (s === null) return null
	const [nr, uname] = await Promise.all([
		nrec_of_uid(s.uid),
		idname(coll.user, [...s.referer, ...s.sec, ...s.uid]),
	])
	return { ...s, nrec: nr, uname }
}
