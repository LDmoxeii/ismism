import { coll, idname, nrec_of_uid } from "../db.ts"
import { Soc } from "../typ.ts"

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
	const [nrec, uname] = await Promise.all([
		nrec_of_uid(s.uid),
		idname(coll.user, s.uid),
	])
	return { ...s, ...nrec, uname }
}
