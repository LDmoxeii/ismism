import { utc_etag } from "../ont/utc.ts"
import { Pas, Psg, pas, psg } from "./pas.ts"
import { Pre, pre } from "./pre.ts"
import { Put, put } from "./put.ts"

export type { Pre } from "./pre.ts"
export type { Put } from "./put.ts"
export type { Psg } from "./pas.ts"

export type Pos = Psg | Pre | Put

export type PasPos = {
	jwt?: string | null,
	pas?: Pas | null,
	etag?: string | null,
}

export async function pos(
	p: PasPos,
	b: string,
) {
	let json
	try { json = b.length > 0 ? JSON.parse(b) as Pos : {} }
	catch { return null }

	if (p.jwt) {
		p.pas = await pas(p.jwt)
		p.jwt = null
	} else p.pas = null

	let r = null
	if ("psg" in json) return psg(p, json)
	else if ("pre" in json) { r = pre(p.pas, json) }
	else if ("put" in json) { r = put(p.pas, json) }

	p.etag = r ? utc_etag() : null
	return r
}
