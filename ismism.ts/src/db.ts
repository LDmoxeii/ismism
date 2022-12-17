import { Collection, MongoClient } from "https://deno.land/x/mongo@v0.31.1/mod.ts"
import { Agenda, Fund, Dat, Soc, User, Work, Worker, Rec, Id, Role, Imgsrc, Txt } from "./typ.ts"

const uri = "mongodb://127.0.0.1:27017"
const mongo = new MongoClient()
await mongo.connect(uri)

export const db = mongo.database("ismism")
export const coll = {
	user: db.collection<User>("user"),
	soc: db.collection<Soc>("soc"),
	agenda: db.collection<Agenda>("agenda"),
	worker: db.collection<Worker>("worker"),
	work: db.collection<Work>("work"),
	fund: db.collection<Fund>("fund"),
	imgsrc: db.collection<Imgsrc>("imgsrc"),
	txt: db.collection<Txt>("txt"),
}

export type CollRec = "work" | "worker" | "fund"

export function collrec(
	s: CollRec | string
): Collection<Rec> | null {
	switch (s) {
		case "work": return coll.work
		case "worker": return coll.worker
		case "fund": return coll.fund
	}
	return null
}

export async function init(
) {
	try { await db.dropDatabase() } catch (e) { console.error(e) }
	await coll.user.createIndexes({
		indexes: [{
			key: { name: 1 }, name: "name", unique: true,
		}, {
			key: { nbr: 1 }, name: "nbr", unique: true,
			partialFilterExpression: { nbr: { $exists: true } }
		}]
	})
	await coll.soc.createIndexes({
		indexes: [{
			key: { name: 1 }, name: "name", unique: true,
		}, {
			key: { uid: 1 }, name: "uid"
		}]
	})
	await coll.agenda.createIndexes({
		indexes: [{
			key: { name: 1 }, name: "name", unique: true,
		}]
	})
	await coll.worker.createIndexes({
		indexes: [{
			key: { "_id.aid": 1, "_id.utc": -1 }, name: "aid-utc"
		}, {
			key: { "_id.uid": 1, "_id.utc": -1 }, name: "uid-utc"
		}, {
			key: { "_id.utc": -1 }, name: "utc"
		}]
	})
	await coll.work.createIndexes({
		indexes: [{
			key: { "_id.aid": 1, "_id.utc": -1 }, name: "aid-utc"
		}, {
			key: { "_id.uid": 1, "_id.utc": -1 }, name: "uid-utc"
		}, {
			key: { "_id.utc": -1 }, name: "utc"
		}]
	})
	await coll.fund.createIndexes({
		indexes: [{
			key: { "_id.aid": 1, "_id.utc": -1 }, name: "aid-utc"
		}, {
			key: { "_id.uid": 1, "_id.utc": -1 }, name: "uid-utc"
		}, {
			key: { "_id.utc": -1 }, name: "utc"
		}]
	})
	await coll.imgsrc.createIndexes({
		indexes: [{
			key: { uid: 1, utc: -1 }, name: "uid-utc"
		}]
	})
	await coll.txt.createIndexes({
		indexes: [{
			key: { uid: 1, utc: -1 }, name: "uid-utc"
		}]
	})
	return await db.listCollectionNames()
}

export function is_id(
	id: number
) {
	return id > 0
}
export function not_id(
	id: number
) {
	return !(id > 0)
}

export async function idname(
	c: Collection<Id>,
	id: number[],
): Promise<[number, string][]> {
	id = [...new Set(id.filter(is_id))]
	const d = await c.find(
		{ _id: { $in: id } },
		{ projection: { _id: 1, name: 1 } }
	).toArray()
	return d.map(d => [d._id, d.name])
}

async function uid_of_sid(
	sid: number
): Promise<Pick<Soc, "uid"> | null> {
	if (not_id(sid)) return null
	const projection = { _id: 0, uid: 1 }
	return await coll.soc.findOne({ _id: sid }, { projection }) ?? null
}

export type URole = [number, [number, Role][]][]

async function urole(
	uid: number[]
): Promise<URole> {
	const r = await coll.worker.aggregate([{
		$match: { "_id.uid": { $in: uid.filter(is_id) } }
	}, {
		$group: { _id: "$_id.uid", r: { $push: { aid: "$_id.aid", role: "$role" } } }
	}]).toArray() as unknown as { _id: number, r: { aid: number, role: Role }[] }[]
	return r.map(({ _id, r }) => [_id, r.map(r => [r.aid, r.role])])
}

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
	uid: number[]
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
	aid: number
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
	uname: [number, string][],
	aname: [number, string][],
	urole: URole,
}

export async function rec_of_recent<T extends Rec>(
	c: Collection<T>,
	utc_lt: number,
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
	c: Collection<T>,
	uid: number[],
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
	c: Collection<T>,
	sid: number,
): Promise<RecOf<T>> {
	const uid = (await uid_of_sid(sid))?.uid ?? []
	return rec_of_uid(c, uid)
}
export async function rec_of_aid<T extends Rec>(
	c: Collection<T>,
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

export async function dat<T extends Dat>(
	c: Collection<T>,
	_id?: Dat["_id"]
): Promise<T | undefined> {
	if (!_id) return undefined
	return await c.findOne({ _id }, { projection: { _id: 0 } })
}
