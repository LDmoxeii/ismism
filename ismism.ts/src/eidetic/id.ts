import { Coll } from "../db.ts"
import { not_adm1, not_adm2 } from "../ontic/adm.ts"
import { Id } from "./dbtyp.ts"

export function is_id(
	id?: null | Id["_id"]
): id is Id["_id"] {
	return typeof id === "number" && id > 0
}
export function not_id(
	id?: null | Id["_id"]
) {
	return !is_id(id)
}

export function is_name(
	name?: null | Id["name"]
) {
	return typeof name === "string" && /^[\u4E00-\u9FFF]{2,16}$/.test(name)
}
export function not_name(
	name?: null | Id["name"]
) {
	return !is_name(name)
}

export function is_intro(
	intro?: null | Id["intro"]
) {
	return typeof intro === "string" && intro.length <= 4096
}
export function not_intro(
	intro?: null | Id["intro"]
) {
	return !is_intro(intro)
}

export async function idname(
	c: Coll["user" | "soc" | "agenda"],
	id: Id["_id"][],
): Promise<[Id["_id"], Id["name"]][]> {
	id = [...new Set(id.filter(is_id))]
	const d = await c.find(
		{ _id: { $in: id } },
		{ projection: { _id: 1, name: 1 } }
	).toArray()
	return d.map(d => [d._id, d.name])
}

export async function id(
	c: Coll["soc" | "agenda"],
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
	c: Coll["soc" | "agenda"],
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
