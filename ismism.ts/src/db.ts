import { Collection, MongoClient } from "https://deno.land/x/mongo@v0.31.1/mod.ts"
import { Agenda, Fund, Soc, User, Work, Worker, Imgsrc, Txt, Act } from "./dbtyp.ts"

const uri = "mongodb://127.0.0.1:27017"
const conn = new MongoClient()
await conn.connect(uri)
const db = conn.database("ismism")

export const coll = {
	user: db.collection<User>("user"),
	soc: db.collection<Soc>("soc"),
	agenda: db.collection<Agenda>("agenda"),
	worker: db.collection<Worker>("worker"),
	work: db.collection<Work>("work"),
	fund: db.collection<Fund>("fund"),
	imgsrc: db.collection<Imgsrc>("imgsrc"),
	txt: db.collection<Txt>("txt"),
	act: db.collection<Act>("act"),
}

export type Coll<T> = Collection<T>
export type CollId = (typeof coll)["user" | "soc" | "agenda"]

export type DocC<T> = Promise<NonNullable<T> | null>
export type DocR<T> = Promise<NonNullable<T> | null>
export type DocU = Promise<0 | 1 | null>
export type DocD = Promise<0 | 1 | null>
export type Doc<T> = DocC<T> | DocR<T> | DocU | DocD

export async function reset(
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
