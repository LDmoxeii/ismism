import { Act, Agd, Aut, Fund, Soc, Usr, Work } from "./eid/typ.ts"
import { Collection, MongoClient, UpdateFilter } from "https://deno.land/x/mongo@v0.31.1/mod.ts"

const conn = new MongoClient()
await conn.connect("mongodb://127.0.0.1:27017")

export async function db(
	nam: "ismism" | "tst",
	reset = false,
) {
	const db = conn.database(nam)

	const c = {
		usr: db.collection<Usr>("usr"),
		soc: db.collection<Soc>("soc"),
		agd: db.collection<Agd>("agd"),
		work: db.collection<Work>("work"),
		fund: db.collection<Fund>("fund"),
		act: db.collection<Act>("act"),
		aut: db.collection<Aut>("aut"),
	}

	if (reset) {
		await db.dropDatabase()
		c.usr.createIndexes({
			indexes: [{
				key: { nam: 1 }, name: "nam", unique: true,
			}, {
				key: { nbr: 1 }, name: "nbr", unique: true,
				partialFilterExpression: { nbr: { $exists: true } },
			}, {
				key: { rej: 1 }, name: "rej",
			}, {
				key: { ref: 1 }, name: "ref",
			}]
		})
		await Promise.all([c.soc, c.agd].map(cl => cl.createIndexes({
			indexes: [{
				key: { nam: 1 }, name: "nam", unique: true,
			}, {
				key: { adm1: 1 }, name: "adm1",
			}, {
				key: { adm2: 1 }, name: "adm2",
			}, {
				key: { sec: 1 }, name: "sec",
			}, {
				key: { uid: 1 }, name: "uid",
			}, {
				key: { res: 1 }, name: "res",
			}]
		})))
		await Promise.all([c.work, c.fund].map(cl => cl.createIndexes({
			indexes: [{
				key: { "_id.aid": 1, "_id.utc": -1 }, name: "aid-utc"
			}, {
				key: { "_id.uid": 1, "_id.utc": -1 }, name: "uid-utc"
			}, {
				key: { "_id.utc": -1 }, name: "utc"
			}]
		})))
	}

	if (nam === "tst") coll = c
	return c
}

export let coll = await db("ismism")

export type Coll<T> = Collection<T>
export type Update<T> = UpdateFilter<T>

export type DocC<_Id> = Promise<NonNullable<_Id> | null>
export type DocR<Doc> = Promise<NonNullable<Doc> | null>
export type DocU = Promise<0 | 1 | null>
export type DocD = Promise<0 | 1 | null>
