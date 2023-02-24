import { Coll, DocR } from "../db.ts"
import { not_id, req_ref } from "./is.ts"
import { Id, Usr } from "./typ.ts"
import { usr_r } from "./usr.ts"

export type Rol = {
	sec: Id["_id"][],
	res: Id["_id"][],
	uid: Id["_id"][],
}
export async function rol(
	c: Coll["soc" | "agd"],
	_id: Usr["_id"],
): DocR<Rol> {
	const r = await rolref(c, _id)
	if (!r) return null
	return {
		sec: r.sec.filter(p => p[1] >= req_ref).map(p => p[0]),
		res: r.res.filter(p => p[1] >= req_ref).map(p => p[0]),
		uid: r.uid.filter(p => p[1] >= req_ref).map(p => p[0]),
	}
}

export type RolRef = {
	sec: [Id["_id"], number][],
	res: [Id["_id"], number][],
	uid: [Id["_id"], number][],
}
export async function rolref(
	c: Coll["soc" | "agd"],
	_id: Usr["_id"],
): DocR<RolRef> {
	if (not_id(_id)) return null
	const [u, sec, res, uid] = await Promise.all([
		usr_r({ _id }, { ref: 1 }),
		// deno-lint-ignore no-explicit-any
		c.find({ sec: _id } as any, { projection: { _id: 1, ref: 1 } }).toArray(),
		// deno-lint-ignore no-explicit-any
		c.find({ res: _id } as any, { projection: { _id: 1, ref: 1 } }).toArray(),
		// deno-lint-ignore no-explicit-any
		c.find({ uid: _id } as any, { projection: { _id: 1, ref: 1 } }).toArray(),
	])
	if (!u) return null
	const nref = (u: Usr["ref"], id: Id["ref"]) => u.filter(r => id.includes(r)).length
	const f = (r: Id) => [r._id, nref(u.ref, r.ref)] as [Id["_id"], number]
	return { sec: sec.map(f), res: res.map(f), uid: uid.map(f) }
}
