import { Collection, IndexOptions, MongoClient, UpdateFilter, Document, Filter } from "./mod.ts"
import { Agd, Aut, Lit, Soc, Usr, Wsl, Cdt, Dbt, Ern, } from "./typ.ts"

export type Coll<T extends Document> = Collection<T>
export type Fltr<T> = Filter<T>
export type Proj<T, P extends keyof T> = Partial<{ [K in P]: 0 } | { [K in P]: 1 }>
export type Updt<T> = UpdateFilter<T>
export type DocC<_Id> = Promise<NonNullable<_Id> | null>
export type DocR<Doc> = Promise<NonNullable<Doc> | null>
export type DocU = Promise<0 | 1 | null>
export type DocD = Promise<0 | 1 | null>

const conn = new MongoClient()
await conn.connect("mongodb://127.0.0.1:27017")

const nam: IndexOptions[] = [{
	key: { nam: 1 }, name: "nam", unique: true,
}]
const nbr: IndexOptions[] = [{
	key: { nbr: 1 }, name: "nbr", unique: true,
	partialFilterExpression: { nbr: { $exists: true } },
}]
const adm: IndexOptions[] = [{
	key: { adm1: 1 }, name: "adm1",
}, {
	key: { adm2: 1 }, name: "adm2",
},]
const sec: IndexOptions[] = [{
	key: { sec: 1 }, name: "sec",
}]
const soc: IndexOptions[] = [{
	key: { soc: 1 }, name: "soc",
}]

const rec: IndexOptions[] = [{
	key: { "_id.usr": 1, "_id.utc": -1 }, name: "usr-utc",
}, {
	key: { "_id.soc": 1, "_id.utc": -1 }, name: "soc-utc",
}, {
	key: { "_id.usr": 1, "_id.soc": 1, "_id.utc": -1 }, name: "usr-soc-utc",
}]
const utc: IndexOptions[] = [{
	key: { "_id.usr": 1, "_id.soc": 1, "utc.eft": -1, "utc.exp": -1 }, name: "usr-eft",
}, {
	key: { "_id.soc": 1, "utc.eft": -1, "utc.exp": -1 }, name: "soc-eft",
}]
const msg: IndexOptions[] = [{
	key: { pin: 1, "utc.put": -1 }, name: "pin",
	partialFilterExpression: { pin: { $exists: true } }
}]

export async function db(
	dbnam: "ismism" | "tst",
	reset = false,
) {
	const db = conn.database(dbnam)
	const c = {
		usr: db.collection<Usr>("usr"),
		soc: db.collection<Soc>("soc"),
		agd: db.collection<Agd>("agd"),

		cdt: db.collection<Cdt>("cdt"),
		dbt: db.collection<Dbt>("dbt"),
		ern: db.collection<Ern>("ern"),

		wsl: db.collection<Wsl>("wsl"),
		lit: db.collection<Lit>("lit"),

		aut: db.collection<Aut>("aut"),
	}

	if (reset) {
		await db.dropDatabase()

		await c.usr.createIndexes({ indexes: [...nam, ...nbr] })
		await c.soc.createIndexes({ indexes: [...nam, ...adm, ...sec] })
		await c.agd.createIndexes({ indexes: [...soc] })

		await c.cdt.createIndexes({ indexes: [...rec, ...utc] })
		await c.dbt.createIndexes({ indexes: [...rec] })
		await c.ern.createIndexes({ indexes: [...rec] })

		await c.wsl.createIndexes({ indexes: [...msg] })
		await c.lit.createIndexes({ indexes: [...msg] })

		await c.aut.insertOne({ _id: 1, sup: [1, 2], aut: [2], wsl: [], lit: [] })
	}

	if (dbnam === "ismism") coll = c
	return c
}

export let coll = await db("tst")
