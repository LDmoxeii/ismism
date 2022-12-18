import { Coll, coll } from "../db.ts"
import { Agenda, Id, Rec, User } from "../typ.ts"
import { idname, is_id, not_id, uid_of_sid, urole, URole } from "./id.ts"

export type NRec = {
	worker: number,
	work: number,
	fund: number
}

export async function nrec(
): Promise<NRec> {
	const [worker, work, fund] = await Promise.all([
		coll.worker.estimatedDocumentCount(),
		coll.work.estimatedDocumentCount(),
		coll.fund.estimatedDocumentCount(),
	])
	return { worker, work, fund }
}
export async function nrec_of_uid(
	uid: User["_id"][]
): Promise<NRec> {
	const filter = { "_id.uid": { $in: uid.filter(is_id) } }
	const [worker, work, fund] = await Promise.all([
		coll.worker.countDocuments(filter),
		coll.work.countDocuments(filter),
		coll.fund.countDocuments(filter),
	])
	return { worker, work, fund }
}
export async function nrec_of_aid(
	aid: Agenda["_id"]
): Promise<NRec> {
	if (not_id(aid)) return { worker: 0, work: 0, fund: 0 }
	const filter = { "_id.aid": aid }
	const [worker, work, fund] = await Promise.all([
		coll.worker.countDocuments(filter),
		coll.work.countDocuments(filter),
		coll.fund.countDocuments(filter),
	])
	return { worker, work, fund }
}

export type RecOf<T extends Rec> = {
	rec: T[],
	uname: [User["_id"], User["name"]][],
	aname: [Agenda["_id"], Agenda["name"]][],
	urole: URole,
}

export type CollRec = "work" | "worker" | "fund"

export function collrec(
	c: CollRec | string
): Coll<Rec> | null {
	switch (c) {
		case "work": return coll.work
		case "worker": return coll.worker
		case "fund": return coll.fund
	}
	return null
}

export async function rec_of_recent<T extends Rec>(
	c: Coll<T>,
	utc_lt: Id["utc"],
	limit: number
): Promise<RecOf<T>> {
	const rec = await c.find(
		// deno-lint-ignore no-explicit-any
		{ "_id.utc": { $lt: utc_lt } } as any, {
		sort: { "_id.utc": -1 },
		limit
	}).toArray()
	const uid = rec.flatMap(r => [r._id.uid, ...r.referer])
	const [uname, aname, ur] = await Promise.all([
		idname(coll.user, uid),
		idname(coll.agenda, rec.map(r => r._id.aid)),
		urole(uid),
	])
	return { rec, uname, aname, urole: ur }
}
export async function rec_of_uid<T extends Rec>(
	c: Coll<T>,
	uid: Id["utc"][],
): Promise<RecOf<T>> {
	uid = uid.filter(is_id)
	const rec = await c.find(
		// deno-lint-ignore no-explicit-any
		{ "_id.uid": { $in: uid } } as any,
		{ sort: { "_id.utc": -1 } }
	).toArray()
	const [uname, aname, ur] = await Promise.all([
		idname(coll.user, [...uid, ...rec.flatMap(r => r.referer)]),
		idname(coll.agenda, rec.map(r => r._id.aid)),
		urole(uid),
	])
	return { rec, uname, aname, urole: ur }
}
export async function rec_of_sid<T extends Rec>(
	c: Coll<T>,
	sid: number,
): Promise<RecOf<T>> {
	const uid = (await uid_of_sid(sid))?.uid ?? []
	return rec_of_uid(c, uid)
}
export async function rec_of_aid<T extends Rec>(
	c: Coll<T>,
	aid: number,
): Promise<RecOf<T>> {
	if (not_id(aid)) return { rec: [], uname: [], aname: [], urole: [] }
	const rec = await c.find(
		// deno-lint-ignore no-explicit-any
		{ "_id.aid": aid } as any,
		{ sort: { "_id.utc": -1 } }
	).toArray()
	const uid = rec.flatMap(r => [r._id.uid, ...r.referer])
	const [uname, aname, ur] = await Promise.all([
		idname(coll.user, uid),
		idname(coll.agenda, [aid]),
		urole(uid),
	])
	return { rec, uname, aname, urole: ur }
}
