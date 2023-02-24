import { Coll } from "../db.ts"
import { not_adm1, not_adm2 } from "../ont/adm.ts"
import { is_id } from "./is.ts"
import { Id } from "./typ.ts"

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
