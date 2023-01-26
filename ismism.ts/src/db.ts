import { Act, Agenda, Aut, Fund, Soc, User, Work, Worker } from "./eidetic/dbtyp.ts"
import { MongoClient } from "https://deno.land/x/mongo@v0.31.1/mod.ts"

const conn = new MongoClient()
await conn.connect("mongodb://127.0.0.1:27017")

export async function db(
	name: "ismism" | "tst",
	reset = false,
) {
	const db = conn.database(name)

	const c = {
		user: db.collection<User>("user"),
		soc: db.collection<Soc>("soc"),
		agenda: db.collection<Agenda>("agenda"),

		worker: db.collection<Worker>("worker"),
		work: db.collection<Work>("work"),
		fund: db.collection<Fund>("fund"),

		act: db.collection<Act>("act"),
		aut: db.collection<Aut>("aut"),
	}

	if (reset) {
		await db.dropDatabase()
		c.user.createIndexes({
			indexes: [{
				key: { name: 1 }, name: "name", unique: true,
			}, {
				key: { nbr: 1 }, name: "nbr", unique: true,
				partialFilterExpression: { nbr: { $exists: true } },
			}]
		})
		await c.soc.createIndexes({
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
		await c.agenda.createIndexes({
			indexes: [{
				key: { name: 1 }, name: "name", unique: true,
			}, {
				key: { adm1: 1 }, name: "adm1",
			}, {
				key: { adm2: 1 }, name: "adm2",
			}]
		})

		await c.worker.createIndexes({
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
		await c.work.createIndexes({
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
		await c.fund.createIndexes({
			indexes: [{
				key: { "_id.aid": 1, "_id.utc": -1 }, name: "aid-utc"
			}, {
				key: { "_id.uid": 1, "_id.utc": -1 }, name: "uid-utc"
			}, {
				key: { "_id.utc": -1 }, name: "utc"
			}]
		})
	}

	if (name === "tst") coll = c
	return c
}

export let coll = await db("ismism")
export type Coll = typeof coll

export type DocC<_Id> = Promise<NonNullable<_Id> | null>
export type DocR<Doc> = Promise<NonNullable<Doc> | null>
export type DocU = Promise<0 | 1 | null>
export type DocD = Promise<0 | 1 | null>
