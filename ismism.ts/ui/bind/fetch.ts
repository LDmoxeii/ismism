import type { Dst, Ord, Rec } from "../../src/eid/typ.ts"
import type { Pos } from "../../src/pra/pos.ts"
import type { Agd } from "./article.ts"

export let utc_etag = Date.now()

export async function que<T>(
	q: string
) {
	const r = await fetch(`/q/${q}`)
	const etag = r.headers.get("etag")?.substring(3)
	if (etag) utc_etag = parseInt(etag)
	return r.json() as T
}

export type PosB = Record<string, string | number | boolean | Agd["img"] | Agd["goal"] | Ord["_id"] | Rec["_id"]> | Dst["_id"]
export async function pos<T>(
	p: Pos,
	b: PosB,
) {
	const res = await fetch(`/p/${p}`, {
		method: "POST",
		body: JSON.stringify(b)
	})
	return res.json() as T
}
