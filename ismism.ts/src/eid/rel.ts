import type { Rel, Usr } from "./typ.ts"
import { Update } from "./db.ts";
import { is_id, is_lim, lim_rel } from "./is.ts";

export type UpdateRel = {
	rel: keyof Rel,
	op: "add" | "pull",
	uid?: Usr["_id"]
}

export function rel_u(
	rel: Rel,
	u: UpdateRel
): Update<Rel> | null {
	if (u.uid !== undefined && !is_id(u.uid)) return null
	const r = rel[u.rel]
	switch (u.op) {
		case "add": {
			if (!u.uid) return r ? null : { $set: { [u.rel]: [] } }
			if (!r || !is_lim(r.length + 1, lim_rel[u.rel])) return null
			return { $addToSet: { [u.rel]: u.uid } }
		} case "pull": {
			if (!u.uid) return r ? { $unset: { [u.rel]: "" } } : null
			if (!r || !r.includes(u.uid)) return null
			return { $pull: { [u.rel]: u.uid } }
		}
	}
}
