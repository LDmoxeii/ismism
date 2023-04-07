import { Act, Agd, Aut, Fund, Lit, Ord, Soc, Usr, Work, Wsl } from "./eid/typ.ts"
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
		ord: db.collection<Ord>("ord"),
		work: db.collection<Work>("work"),
		fund: db.collection<Fund>("fund"),
		act: db.collection<Act>("act"),
		aut: db.collection<Aut>("aut"),

		wsl: db.collection<Wsl>("wsl"),
		lit: db.collection<Lit>("lit"),
	}

	if (reset) {
		await db.dropDatabase()
		await c.usr.createIndexes({
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
		await c.ord.createIndexes({
			indexes: [{
				key: { "_id.aid": 1, "_id.utc": -1 }, name: "aid-utc"
			}, {
				key: { "_id.nbr": 1, "_id.utc": -1 }, name: "nbr-utc"
			}, {
				key: { "_id.utc": -1 }, name: "utc"
			}]
		})
		await Promise.all([c.work, c.fund].map(cl => cl.createIndexes({
			indexes: [{
				key: { "_id.aid": 1, "_id.utc": -1 }, name: "aid-utc"
			}, {
				key: { "_id.uid": 1, "_id.utc": -1 }, name: "uid-utc"
			}, {
				key: { "_id.utc": -1 }, name: "utc"
			}]
		})))
		await c.work.createIndexes({
			indexes: [{
				key: { work: 1, utce: -1, "_id.utc": -1 }, name: "live",
				partialFilterExpression: { work: "live" },
			}]
		})
		await Promise.all([c.wsl, c.lit].map(cl => cl.createIndexes({
			indexes: [{
				key: { pin: 1, utcp: -1 }, name: "pin",
				partialFilterExpression: { pin: { $exists: true } }
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
