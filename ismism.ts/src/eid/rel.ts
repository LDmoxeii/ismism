import type { Id, Rel, Usr } from "./typ.ts"
import { Coll, DocR } from "../db.ts"
import { is_id, req_re } from "./is.ts"
import { usr_r } from "./usr.ts"
import { IdNRef, idnref } from "./re.ts"

export type Rol = {
	sec: Id["_id"][],
	uid: Id["_id"][],
	res: Id["_id"][],
}
export async function rol<
	T extends Id & Rel
>(
	c: Coll<T>,
	_id: Usr["_id"],
): DocR<Rol> {
	const r = await rolref(c, _id)
	if (!r) return null
	const f = (ts: IdNRef[]) => ts.filter(t => t[1] >= req_re).map(idn => idn[0])
	return { sec: f(r.sec), uid: f(r.uid), res: f(r.res) }
}

export type RolRef = {
	sec: IdNRef[],
	uid: IdNRef[],
	res: IdNRef[],
}
export async function rolref<
	T extends Id & Rel
>(
	c: Coll<T>,
	_id: Usr["_id"],
): DocR<RolRef> {
	if (!is_id(_id)) return null
	const [u, sec, uid, res] = await Promise.all([
		usr_r({ _id }, { ref: 1 }),
		// deno-lint-ignore no-explicit-any
		c.find({ sec: _id } as any, { projection: { _id: 1, ref: 1 } }).toArray(),
		// deno-lint-ignore no-explicit-any
		c.find({ uid: _id } as any, { projection: { _id: 1, sec: 1 } }).toArray(),
		// deno-lint-ignore no-explicit-any
		c.find({ res: _id } as any, { projection: { _id: 1, sec: 1 } }).toArray(),
	])
	if (!u) return null
	return {
		sec: sec.map(t => idnref(t._id, t.ref, u.ref)),
		uid: uid.map(t => idnref(t._id, t.sec, u.ref)),
		res: res.map(t => idnref(t._id, t.sec, u.ref)),
	}
}
