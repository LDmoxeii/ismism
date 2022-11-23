import { Collection, MongoClient } from "https://deno.land/x/mongo@v0.31.1/mod.ts"
import { Agenda, Fund, Dat, Soc, User, Work, Worker, Rec } from "./typ.ts"

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
	dat: db.collection<Dat>("dat"),
}

export async function init(
) {
	try { await db.dropDatabase() } catch (e) { console.error(e) }
	await coll.user.createIndexes({
		indexes: [{
			key: { nbr: 1 }, name: "nbr", unique: true,
		}, {
			key: { name: 1 }, name: "name", unique: true,
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
			key: { uid: 1, "_id.utc": -1 }, name: "uid-utc"
		}]
	})
	await coll.work.createIndexes({
		indexes: [{
			key: { "_id.aid": 1, "_id.utc": -1 }, name: "aid-utc"
		}, {
			key: { uid: 1, "_id.utc": -1 }, name: "uid-utc"
		}]
	})
	await coll.fund.createIndexes({
		indexes: [{
			key: { "_id.aid": 1, "_id.utc": -1 }, name: "aid-utc"
		}, {
			key: { uid: 1, "_id.utc": -1 }, name: "uid-utc"
		}]
	})
	await coll.dat.createIndexes({
		indexes: [{
			key: { "_id.aid": 1, typ: 1, "_id.utc": -1 }, name: "aid-typ-utc"
		}]
	})
	return await db.listCollectionNames()
}

export async function idname(
	c: Collection<User> | Collection<Soc> | Collection<Agenda>,
	id: number[],
): Promise<[number, string][]> {
	id = [...new Set(id)]
	const d = await c.find(
		{ _id: { $in: id } },
		{ projection: { _id: 1, name: 1 } }
	).toArray()
	return d.map(d => [d._id, d.name])
}

export function nrec_of_uid<T extends Rec>(
	c: Collection<T>,
	id: number[],
) {
	// deno-lint-ignore no-explicit-any
	return c.countDocuments({ uid: { $in: id } } as any)
}
export function rec_of_uid<T extends Rec>(
	c: Collection<T>,
	id: number[],
) {
	id = [...new Set(id)]
	return c.find(
		// deno-lint-ignore no-explicit-any
		{ uid: { $in: id } } as any,
		{ sort: { "_id.utc": -1 } }
	).toArray()
}

export async function nrec_of_aid<T extends Rec>(
	c: Collection<T>,
	aid: number,
) {
	if (aid === 0) return 0
	// deno-lint-ignore no-explicit-any
	return await c.countDocuments({ "_id.aid": aid } as any)
}
export async function rec_of_aid<T extends Rec>(
	c: Collection<T>,
	aid: number,
) {
	if (aid === 0) return []
	return await c.find(
		// deno-lint-ignore no-explicit-any
		{ "_id.aid": aid } as any,
		{ sort: { "_id.utc": -1 } }
	).toArray()
}
