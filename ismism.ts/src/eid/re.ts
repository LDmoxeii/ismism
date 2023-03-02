import type { Id, Re, Rel, Usr } from "./typ.ts"
import type { Coll, Update } from "../db.ts"
import { is_lim, lim_re } from "./is.ts"

export type NRef = number
export type IdNRef = [Id["_id"], NRef]
export type UpdateRe = {
	re: keyof Re,
	add: boolean,
	uid: Usr["_id"],
}

export async function re_u<
	_Id, T extends { _id: _Id } & Re
>(
	c: Coll<T>,
	_id: T["_id"],
	u: UpdateRe,
): Promise<Update<T> | null> {
	if (u.add) { // deno-lint-ignore no-explicit-any
		const re = await c.findOne({ _id } as any, { projection: { [u.re]: 1 } })
		if (!re || !is_lim(re[u.re].length, lim_re - 1)) return null // deno-lint-ignore no-explicit-any
		return { $addToSet: { [u.re]: u.uid } } as any // deno-lint-ignore no-explicit-any
	} else return { $pull: { [u.re]: u.uid } } as any
}

export function idnref(
	id: Id["_id"],
	idr: Re["ref"] | Rel["sec"],
	ref: Re["ref"],
): IdNRef {
	return [id, idr.length > ref.length
		? idr.filter(r => ref.includes(r)).length
		: ref.filter(r => idr.includes(r)).length
	]
}
