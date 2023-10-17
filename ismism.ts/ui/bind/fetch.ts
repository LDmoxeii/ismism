import type { Pos } from "../../src/pra/pos.ts"
import type { Que } from "../../src/pra/que.ts"

export async function que<T>(
	q: Que
) {
	const s = Object.entries(q)
		.map(([k, v]) => `${k}=${typeof v == "string" ? `"${v}"` : v}`)
		.join("&")
	const r = await fetch(`/q?${s}`)
	return r.json() as T
}

export async function pos<T>(
	p: Pos,
) {
	const r = await fetch(`/p`, { method: "POST", body: JSON.stringify(p) })
	return r.json() as T
}
