import type { Re, Usr } from "./typ.ts"
import type { Update } from "./db.ts"
import { is_id, is_lim } from "./is.ts"
import { lim_re } from "./is.ts"

export type UpdateRe = {
	re: keyof Re,
	op: "add" | "set" | "pull",
	uid: Usr["_id"],
}

export function re_u(
	re: Re,
	u: UpdateRe,
): Update<Re> | null {
	if (!is_id(u.uid)) return null
	const r = re[u.re]
	switch (u.op) {
		case "add": {
			if (r && !is_lim(r.length + 1, lim_re)) return null
			return { $addToSet: { [u.re]: u.uid } }
		} case "set": {
			return { $set: { [u.re]: [u.uid] } }
		} case "pull": {
			if (!r || !r.includes(u.uid)) return null
			return r.length === 1 ? { $unset: { [u.re]: "" } } : { $pull: { [u.re]: u.uid } }
		}
	}
}
