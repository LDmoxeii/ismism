import type { Aut, Id } from "../eid/typ.ts"

export function is_re(
	re?: null | string
): re is "rej" | "ref" {
	return re === "rej" || re === "ref"
}

export function is_pro(
	{ rej, ref }: Pick<Id, "rej" | "ref">,
): boolean {
	return rej.length < 2 && ref.length >= 2
}
export function not_pro(
	re: Pick<Id, "rej" | "ref">,
) {
	return !is_pro(re)
}

export function is_aut(
	aut: Aut["aut"],
	p: Aut["aut"][0],
): boolean {
	return aut.includes(p)
}
export function not_aut(
	aut: Aut["aut"],
	p: Aut["aut"][0],
) {
	return !is_aut(aut, p)
}

export const goal_max = 9
