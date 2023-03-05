import type { Id, Re, Rel, Usr } from "./typ.ts"
import { coll, Coll, Update } from "../db.ts"
import { is_lim, lim_re } from "./is.ts"
import { nid } from "./id.ts"

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
	if (u.add) {
		const [nre, re] = await Promise.all([  // deno-lint-ignore no-explicit-any
			c === coll.usr as any ? nid(coll.usr, { [u.re]: u.uid }) : 0, // deno-lint-ignore no-explicit-any
			c.findOne({ _id } as any, { projection: { [u.re]: 1 } })
		])
		if (!is_lim(nre, lim_re - 1) || !re || !is_lim(re[u.re].length, lim_re - 1)) return null // deno-lint-ignore no-explicit-any
		return { $addToSet: { [u.re]: u.uid } } as any // deno-lint-ignore no-explicit-any
	} else return { $pull: { [u.re]: u.uid } } as any
}

export function idnref(
	id: Id["_id"],
	idr: Re["ref"] | Rel["sec"],
	ref: Re["ref"],
): IdNRef {
	const rs = new Set(idr)
	return [id, ref.filter(r => rs.has(r)).length]
}
