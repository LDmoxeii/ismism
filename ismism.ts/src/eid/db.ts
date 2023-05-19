import { Collection, IndexOptions, MongoClient, UpdateFilter, Document } from "./mod.ts"
import { Act, Agd, Aut, Dst, Lit, Ord, Soc, Usr, Video, Work, Wsl } from "./typ.ts"

const conn = new MongoClient()
await conn.connect("mongodb://127.0.0.1:27017")

export let coll = await db("tst", true)

export type Coll<T extends Document> = Collection<T>
export type Update<T> = UpdateFilter<T>
export type DocC<_Id> = Promise<NonNullable<_Id> | null>
export type DocR<Doc> = Promise<NonNullable<Doc> | null>
export type DocU = Promise<0 | 1 | null>
export type DocD = Promise<0 | 1 | null>

const nam: IndexOptions[] = [{
	key: { nam: 1 }, name: "nam", unique: true,
}]
const adm: IndexOptions[] = [{
	key: { adm1: 1 }, name: "adm1",
}, {
	key: { adm2: 1 }, name: "adm2",
},]
const re: IndexOptions[] = [{
	key: { rej: 1 }, name: "rej",
	partialFilterExpression: { rej: { $exists: true } },
}, {
	key: { ref: 1 }, name: "ref",
	partialFilterExpression: { ref: { $exists: true } },
}]
const rel: IndexOptions[] = [{
	key: { sec: 1 }, name: "sec",
}, {
	key: { uid: 1 }, name: "uid",
}, {
	key: { res: 1 }, name: "res",
	partialFilterExpression: { res: { $exists: true } },
}]
const nbr: IndexOptions[] = [{
	key: { nbr: 1 }, name: "nbr", unique: true,
	partialFilterExpression: { nbr: { $exists: true } },
}]
const rec: IndexOptions[] = [{
	key: { "_id.uid": 1, "_id.utc": -1 }, name: "uid-utc"
}, {
	key: { "_id.aid": 1, "_id.utc": -1 }, name: "aid-utc"
}, {
	key: { "_id.utc": -1 }, name: "utc"
}]
const live: IndexOptions[] = [{
	key: { "utc.end": -1, "utc.start": -1 }, name: "live",
	partialFilterExpression: { utc: { $exists: true } },
}]
const dst: IndexOptions[] = [{
	key: { "_id.rd": 1, "_id.aid": 1, "_id.uid": 1 }, name: "rd-aid-uid",
}]
const md: IndexOptions[] = [{
	key: { pin: 1, "utc.put": -1 }, name: "pin",
	partialFilterExpression: { pin: { $exists: true } }
}]

export async function db(
	dbnam: "ismism-dev" | "tst",
	reset = false,
) {
	const db = conn.database(dbnam)
	const c = {
		usr: db.collection<Usr>("usr"),
		agd: db.collection<Agd>("agd"),
		soc: db.collection<Soc>("soc"),

		work: db.collection<Work>("work"),
		video: db.collection<Video>("video"),
		ord: db.collection<Ord>("ord"),
		dst: db.collection<Dst>("dst"),

		wsl: db.collection<Wsl>("wsl"),
		lit: db.collection<Lit>("lit"),

		aut: db.collection<Aut>("aut"),
		act: db.collection<Act>("act"),
	}

	if (reset) {
		await db.dropDatabase()
		await c.usr.createIndexes({ indexes: [...nam, ...nbr, ...re] })
		await c.agd.createIndexes({ indexes: [...nam, ...adm, ...re, ...rel] })
		await c.soc.createIndexes({ indexes: [...nam, ...adm, ...re, ...rel] })

		await c.work.createIndexes({ indexes: [...rec] })
		await c.video.createIndexes({ indexes: [...rec, ...live] })
		await c.ord.createIndexes({ indexes: [...rec] })
		await c.dst.createIndexes({ indexes: [...dst] })

		await c.wsl.createIndexes({ indexes: [...md] })
		await c.lit.createIndexes({ indexes: [...md] })
	}

	if (dbnam === "ismism-dev") coll = c
	return c
}
