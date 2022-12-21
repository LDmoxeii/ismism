import { coll, CollId } from "../db.ts"
import { Agenda, Id, Role, Soc, User } from "../dbtyp.ts"

export function is_id(
	id: Id["_id"]
) {
	return id > 0
}
export function not_id(
	id: Id["_id"]
) {
	return !(id > 0)
}

export async function idname(
	c: CollId,
	id: Id["_id"][],
): Promise<[Id["_id"], Id["name"]][]> {
	id = [...new Set(id.filter(is_id))]
	const d = await c.find(
		{ _id: { $in: id } },
		{ projection: { _id: 1, name: 1 } }
	).toArray()
	return d.map(d => [d._id, d.name])
}

export async function uid_of_sid(
	sid: Soc["_id"]
): Promise<Pick<Soc, "uid"> | null> {
	if (not_id(sid)) return null
	const projection = { _id: 0, uid: 1 }
	return await coll.soc.findOne({ _id: sid }, { projection }) ?? null
}

export type URole = [User["_id"], [Agenda["_id"], Role][]][]

export async function urole(
	uid: User["_id"][]
): Promise<URole> {
	const r = await coll.worker.aggregate([{
		$match: { "_id.uid": { $in: uid.filter(is_id) } }
	}, {
		$group: { _id: "$_id.uid", r: { $push: { aid: "$_id.aid", role: "$role" } } }
	}]).toArray() as unknown as { _id: number, r: { aid: number, role: Role }[] }[]
	return r.map(({ _id, r }) => [_id, r.map(r => [r.aid, r.role])])
}
