import { Id, Re, Rel } from "./typ.ts"

export type NRef = number
export type IdNRef = [Id["_id"], NRef]

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
