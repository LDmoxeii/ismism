import type { Ret } from "./con.ts"
import { utc_etag } from "../ont/utc.ts"
import { pas, Pas, pas_clear, pas_code, pas_issue } from "./pas.ts"
import { pro_agd, pro_soc, pro_usr, pro_work } from "./pro.ts"

export type PasPos = {
	jwt?: string | null,
	pas?: Pas | null,
	etag?: string | null,
}
export type Pos = "pas"
export type PasCode = Ret<typeof pas_code>

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

	switch (f) {
		case "pas": {
			const { uid, sms, nbr, code } = json
			if (typeof uid === "number") {
				p.jwt = null
				if (p.pas && uid === p.pas.uid) {
					p.pas = null
					return pas_clear(uid)
				}
			} else if (typeof sms === "boolean" && typeof nbr === "string") {
				return await pas_code(nbr, sms)
			} else if (typeof nbr === "string" && typeof code === "number") {
				const issue = await pas_issue(nbr, code)
				if (issue) {
					p.pas = issue.pas
					p.jwt = issue.jwt
					return issue.pas
				}
			} else if (p.pas) return p.pas
			break
		}

		case "pro": {
			p.etag = utc_etag()
			const { re, uid, sid, aid, workid, pro } = json
			if (p.pas && typeof re === "string" && typeof pro === "boolean") {
				const r = re as "rej" | "ref"
				if (typeof uid === "number") return pro_usr(p.pas, r, uid, pro)
				else if (typeof sid === "number") return pro_soc(p.pas, r, sid, pro)
				else if (typeof aid === "number") return pro_agd(p.pas, r, aid, pro)
				else if (typeof workid === "object" && Object.keys(workid).length === 3)
					return pro_work(p.pas, r, workid, pro)
			}
			break
		}
	}

	p.etag = null
	return null
}
