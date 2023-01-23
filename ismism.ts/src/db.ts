import { Act, Agenda, Aut, Fund, Imgsrc, Soc, User, Work, Worker } from "./eidetic/dbtyp.ts"
import { MongoClient } from "https://deno.land/x/mongo@v0.31.1/mod.ts"

const conn = new MongoClient()
await conn.connect("mongodb://127.0.0.1:27017")
const db = conn.database("ismism")

export const coll = {
	user: db.collection<User>("user"),
	soc: db.collection<Soc>("soc"),
	agenda: db.collection<Agenda>("agenda"),

	worker: db.collection<Worker>("worker"),
	work: db.collection<Work>("work"),
	fund: db.collection<Fund>("fund"),

	act: db.collection<Act>("act"),
	aut: db.collection<Aut>("aut"),

	imgsrc: db.collection<Imgsrc>("imgsrc"),
}

export type DocC<T> = Promise<NonNullable<T> | null>
export type DocR<T> = Promise<NonNullable<T> | null>
export type DocU = Promise<0 | 1 | null>
export type DocD = Promise<0 | 1 | null>
export type Doc<T> = DocC<T> | DocR<T> | DocU | DocD

export async function reset(
) {
	try { await db.dropDatabase() } catch (e) { console.error(e) }
	coll.user.createIndexes({
		indexes: [{
			key: { name: 1 }, name: "name", unique: true,
		}, {
			key: { nbr: 1 }, name: "nbr", unique: true,
			partialFilterExpression: { nbr: { $exists: true } },
		}]
	})
	await coll.soc.createIndexes({
		indexes: [{
			key: { name: 1 }, name: "name", unique: true,
		}, {
			key: { uid: 1 }, name: "uid",
		}, {
			key: { adm1: 1 }, name: "adm1",
		}, {
			key: { adm2: 1 }, name: "adm2",
		}]
	})
	await coll.agenda.createIndexes({
		indexes: [{
			key: { name: 1 }, name: "name", unique: true,
		}, {
			key: { adm1: 1 }, name: "adm1",
		}, {
			key: { adm2: 1 }, name: "adm2",
		}]
	})

	await coll.worker.createIndexes({
		indexes: [{
			key: { "_id.utc": -1 }, name: "utc"
		}, {
			key: { "_id.aid": 1, "_id.utc": -1 }, name: "aid-utc"
		}, {
			key: { "_id.aid": 1, role: 1, "_id.utc": -1 }, name: "aid-role-utc"
		}, {
			key: { "_id.uid": 1, "_id.utc": -1 }, name: "uid-utc"
		}]
	})
	await coll.work.createIndexes({
		indexes: [{
			key: { "_id.aid": 1, "_id.utc": -1 }, name: "aid-utc"
		}, {
			key: { "_id.aid": 1, work: 1, "_id.utc": -1 }, name: "aid-work-utc"
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

	return await db.listCollectionNames()
}
