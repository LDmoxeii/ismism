import { is_nbr } from "../eid/is.ts"
import { utc_etag } from "../ont/utc.ts";
import { Ret } from "./can.ts"
import { Pas, pas, pas_clear, pas_code, pas_issue } from "./pas.ts"
import { pre } from "./pre.ts"
import { put } from "./put.ts"

export type Pos = "pas" | "pre" | "pro" | "put"
export type { Pas } from "./pas.ts"
export type PasCode = Ret<typeof pas_code>

export type PasPos = {
	jwt?: string | null,
	pas?: Pas | null,
	etag?: string | null,
}

export async function pos(
	p: PasPos,
	f: Pos | string,
	b: string,
) {
	let json
	try { json = b.length > 0 ? JSON.parse(b) : {} }
	catch { return null }

	if (p.jwt) {
		p.pas = await pas(p.jwt)
		p.jwt = null
	} else p.pas = null

	let r = null
	switch (f) {
		case "pas": {
			const { usr, sms, nbr, code } = json
			if (typeof usr === "number") {
				p.jwt = null
				if (p.pas && usr === p.pas.usr) {
					p.pas = null
					return pas_clear(usr)
				}
			} else if (is_nbr(nbr) && typeof sms === "boolean") {
				return await pas_code(nbr, sms)
			} else if (is_nbr(nbr) && typeof code === "number") {
				const issue = await pas_issue(nbr, code)
				if (issue) {
					p.pas = issue.pas
					p.jwt = issue.jwt
					return issue.pas
				}
			} else if (p.pas) return p.pas
			break
		}

		case "pre": { r = await pre(p.pas, json); break }
		case "put": { r = await put(p.pas, json); break }
	}

	p.etag = r ? utc_etag() : null
	return r
}
