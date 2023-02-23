import { Coll } from "../db.ts"
import { not_adm1, not_adm2 } from "../ont/adm.ts"
import { is_id, not_id } from "./is.ts"
import { Id, Usr } from "./typ.ts"

export async function idnam(
	c: Coll["usr" | "soc" | "agd"],
	id: Id["_id"][],
): Promise<[Id["_id"], Id["nam"]][]> {
	id = [...new Set(id.filter(is_id))]
	const d = await c.find(
		{ _id: { $in: id } },
		{ projection: { _id: 1, nam: 1 } }
	).toArray()
	return d.map(d => [d._id, d.nam])
}

export async function id_of_uid(
	c: Coll["soc" | "agd"],
	_id: Usr["_id"],
): Promise<{ sec: Id["_id"][], res: Id["_id"][], uid: Id["_id"][] }> {
	if (not_id(_id)) return { sec: [], res: [], uid: [] }
	const [sec, res, uid] = await Promise.all([
		// deno-lint-ignore no-explicit-any
		c.find({ sec: _id } as any, { projection: { _id: 1 } }).toArray(),
		// deno-lint-ignore no-explicit-any
		c.find({ res: _id } as any, { projection: { _id: 1 } }).toArray(),
		// deno-lint-ignore no-explicit-any
		c.find({ uid: _id } as any, { projection: { _id: 1 } }).toArray(),
	])
	return { sec: sec.map(s => s._id), res: res.map(s => s._id), uid: uid.map(s => s._id) }
}

export async function id_of_adm(
	c: Coll["soc" | "agd"],
	adm?: { adm1: string } | { adm2: string },
): Promise<Id["_id"][]> {
	if (adm && "adm2" in adm && not_adm2(adm.adm2)) return []
	if (adm && "adm1" in adm && not_adm1(adm.adm1)) return []
	const d = await c.find(adm, { projection: { _id: 1 }, sort: { _id: -1 } }).toArray()
	return d.map(d => d._id)
}

export async function nid_of_adm<
	A extends "adm1" | "adm2"
>(
	c: Coll["soc" | "agd"],
	a: A,
): Promise<[Id[A], number][]> {
	const d = await c.aggregate<{
		_id: Id[A], nid: number
	}>([{
		$group: { _id: `$${a}`, nid: { $count: {} } },
	}, {
		$sort: { nid: -1 },
	}]).toArray()
	return d.map(d => [d._id, d.nid])
}
