import type { Id, Rel, Usr } from "./typ.ts"
import type { Coll, DocR, Update } from "../db.ts"
import { is_id, is_lim, lim_sec } from "./is.ts"

export type Rol = {
	sec: Id["_id"][],
	uid: Id["_id"][],
	res: Id["_id"][],
}
export type UpdateRel = {
	rol: keyof Rol,
	add: boolean,
} | {
	rol: keyof Rol,
	add: boolean,
	uid: Usr["_id"],
}

export async function rel_u<
	_Id, T extends { _id: _Id } & Rel
>(
	c: Coll<T>,
	_id: T["_id"],
	u: UpdateRel,
): Promise<Update<T> | null> {
	if (u.add && "uid" in u && is_id(u.uid)) {
		const projection = {
			[u.rol]: 1,
			...u.rol === "sec" ? {} : { [`${u.rol}lim`]: 1 },
			...u.rol === "uid" ? { res: 1 } : {},
		} // deno-lint-ignore no-explicit-any
		const rel = await c.findOne({ _id } as any, { projection })
		if (!rel) return null
		const lim = u.rol === "sec" ? lim_sec : rel ? rel[`${u.rol}lim`] : 0
		if (!is_lim(rel[u.rol].length, lim - 1) || u.rol === "uid" && !rel.res.includes(u.uid)) return null
		return {
			$addToSet: { [u.rol]: u.uid },
			...u.rol === "uid" ? { $pull: { res: u.uid } } : {} // deno-lint-ignore no-explicit-any
		} as any // deno-lint-ignore no-explicit-any
	} else if (!u.add && "uid" in u && is_id(u.uid)) return { $pull: { [u.rol]: u.uid } } as any
	else if (u.add && u.rol !== "res") {
		const projection = {
			[u.rol]: 1,
			...u.rol === "sec" ? {} : { [`${u.rol}lim`]: 1 },
			res: 1,
		} // deno-lint-ignore no-explicit-any
		const rel = await c.findOne({ _id } as any, { projection })
		if (!rel) return null
		const lim = u.rol === "sec" ? lim_sec : rel ? rel[`${u.rol}lim`] : 0
		const id = [...new Set([...rel[u.rol], ...rel.res])].slice(0, lim)
		return {
			$set: { [u.rol]: id, res: rel.res.filter(n => !id.includes(n)) }, // deno-lint-ignore no-explicit-any
		} as any  // deno-lint-ignore no-explicit-any
	} else if (!u.add) return { $set: { [u.rol]: [] } } as any
	return null
}

export async function rol<
	T extends Id & Rel
>(
	c: Coll<T>,
	_id: Usr["_id"],
): DocR<Rol> {
	if (!is_id(_id)) return null
	const [sec, uid, res] = await Promise.all([ // deno-lint-ignore no-explicit-any
		c.find({ sec: _id } as any, { projection: { _id: 1 } }).toArray(), // deno-lint-ignore no-explicit-any
		c.find({ uid: _id } as any, { projection: { _id: 1 } }).toArray(), // deno-lint-ignore no-explicit-any
		c.find({ res: _id } as any, { projection: { _id: 1 } }).toArray(),
	])
	return { sec: sec.map(t => t._id), uid: uid.map(t => t._id), res: res.map(t => t._id), }
}
