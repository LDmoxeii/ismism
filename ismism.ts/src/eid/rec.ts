import { coll, Coll, DocC, DocD, DocR, DocU, Update } from "../db.ts"
import { Agd, Fund, Rec, Usr, Work, Worker } from "./typ.ts"
import { is_id, not_id } from "./id.ts"

type RecD<C extends Coll["worker" | "work" | "fund"]> =
	C extends Coll["worker"] ? Worker :
	C extends Coll["work"] ? Work : Fund

export function is_recid(
	id: Rec["_id"]
): id is Rec["_id"] {
	return Object.keys(id).length === 3 && is_id(id.uid) && is_id(id.aid) && id.utc > 0
}
export function not_recid(
	id: Rec["_id"]
) {
	return !is_recid(id)
}

export function is_rec(
	r: Rec
): r is Rec {
	return is_recid(r._id) && r.ref.every(is_id) && r.rej.every(is_id)
}
export function not_rec(
	r: Rec
) {
	return !is_rec(r)
}

export function is_rol(
	urol: URol[0][1],
	[aid, rol]: URol[0][1][0],
) {
	return urol.some(([a, r]) => a === aid && r === rol)
}
export function not_rol(
	urol: URol[0][1],
	aidrol: URol[0][1][0],
) {
	return !is_rol(urol, aidrol)
}

export function collrec(
	c: "worker" | "work" | "fund" | string
) {
	switch (c) {
		case "worker": return coll.worker
		case "work": return coll.work
		case "fund": return coll.fund
	}
	return null
}

export async function rec_c<
	C extends Coll["worker" | "work" | "fund"]
>(
	c: C,
	r: RecD<C>,
): DocC<Rec["_id"]> {
	if (not_rec(r)) return null
	// deno-lint-ignore no-explicit-any
	try { return await c.insertOne(r as any) as Rec["_id"] }
	catch { return null }
}

export async function rec_r<
	C extends Coll["worker" | "work" | "fund"]
>(
	c: C,
	utc: number,
	id?: { "_id.aid": Agd["_id"] } | { "_id.uid": Usr["_id"] },
	rw?: { rol: Worker["rol"] } | { work: Work["work"] }
): DocR<RecD<C>[]> {
	if (id && "_id.aid" in id && not_id(id["_id.aid"])) return null
	if (id && "_id.uid" in id && not_id(id["_id.uid"])) return null
	const f = {
		...id ? id : {},
		...rw && c === coll.worker && "rol" in rw && rw.rol ? rw : {},
		...rw && c === coll.work && "work" in rw && rw.work ? rw : {},
		...utc > 0 ? { "_id.utc": { $gt: utc } } : {},
		// deno-lint-ignore no-explicit-any
	} as any
	return await c.find(f, { sort: { utc: -1 }, limit: 16 }).toArray() as RecD<C>[]
}

export async function rec_u<
	C extends Coll["worker" | "work" | "fund"]
>(
	c: C,
	_id: Rec["_id"],
	u: Update<RecD<C>>,
): DocU {
	if (not_recid(_id)) return null
	try {
		const { modifiedCount } = await c.updateOne({ _id }, u)
		return modifiedCount > 0 ? 1 : 0
	} catch { return null }
}

export async function rec_d(
	c: Coll["worker" | "work" | "fund"],
	_id: Rec["_id"],
): DocD {
	if (not_recid(_id)) return null
	try {
		const d = await c.deleteOne({ _id })
		return d > 0 ? 1 : 0
	} catch { return null }
}

export async function nrec(
	id?: { "_id.aid": Agd["_id"] } | { "_id.uid": Usr["_id"] },
): DocR<{ worker: number, work: number, fund: number }> {
	if (id && "_id.aid" in id && not_id(id["_id.aid"])) return null
	if (id && "_id.uid" in id && not_id(id["_id.uid"])) return null
	return id ? {
		worker: await coll.worker.countDocuments(id),
		work: await coll.work.countDocuments(id),
		fund: await coll.fund.countDocuments(id),
	} : {
		worker: await coll.worker.estimatedDocumentCount(),
		work: await coll.work.estimatedDocumentCount(),
		fund: await coll.fund.estimatedDocumentCount(),
	}
}

export type URol = [Usr["_id"], [Agd["_id"], Worker["rol"]][]][]
export async function urol(
	uid: Usr["_id"][]
): Promise<URol> {
	uid = Array.from(new Set(uid.filter(is_id)))
	const r = await coll.worker.aggregate([{
		$match: { "_id.uid": { $in: uid.filter(is_id) }, exp: { $gt: Date.now() } }
	}, {
		$group: {
			_id: "$_id.uid", r: {
				$push: {
					aid: "$_id.aid",
					rol: "$rol",
					rej: { $size: "$rej" },
					ref: { $size: "$ref" }
				}
			}
		}
	}]).toArray() as unknown as {
		_id: number, r: {
			aid: Agd["_id"],
			rol: Worker["rol"],
			rej: number,
			ref: number
		}[]
	}[]
	return r.map(({ _id, r }) => [_id, r
		.filter(r => r.rej < 2 && r.ref >= 2)
		.map(r => [r.aid, r.rol])
	])
}
