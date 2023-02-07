import { utc_etag } from "../ont/utc.ts"
import { pas, Pas, pas_clear, pas_code, pas_issue } from "./pas.ts"
import { pre_usr, pre_usract } from "./pre.ts"
import { is_re, pro_agd, pro_rec, pro_soc, pro_usr } from "./pro.ts"
import { put_usr } from "./put.ts"

// deno-lint-ignore no-explicit-any
type Ret<T extends (...args: any) => any> = Awaited<ReturnType<T>>

export type Pos = "pas" | "pre" | "pro"
export type PasPos = { jwt?: string | null, pas?: Pas | null, etag?: string | null }
export type PasCode = Ret<typeof pas_code>
export type UsrAct = Ret<typeof pre_usract>

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
				if (p.pas && uid === p.pas.id.uid) {
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

		case "pre": {
			p.etag = utc_etag()
			const { actid, nbr, adm1, adm2 } = json
			if (typeof nbr === "string" && typeof adm1 === "string" && typeof adm2 === "string")
				if (typeof actid === "string") return pre_usract(actid, nbr, adm1, adm2)
				else if (p.pas) return pre_usr(p.pas, nbr, adm1, adm2)
			break
		}

		case "pro": {
			p.etag = utc_etag()
			const { re, uid, sid, aid, rec, recid, pro } = json
			if (p.pas && is_re(re) && typeof pro === "boolean")
				if (typeof uid === "number") return pro_usr(p.pas, re, uid, pro)
				else if (typeof sid === "number") return pro_soc(p.pas, re, sid, pro)
				else if (typeof aid === "number") return pro_agd(p.pas, re, aid, pro)
				else if (typeof rec === "string" && typeof recid === "object") return pro_rec(p.pas, re, rec, recid, pro)
			break
		}

		case "put": {
			p.etag = utc_etag()
			const { uid, sid, aid, nam, adm1, adm2, intro } = json
			if (p.pas && typeof nam === "string" && typeof adm1 === "string" && typeof adm2 === "string" && typeof intro === "string")
				if (typeof uid === "number") return put_usr(p.pas, uid, { nam, adm1, adm2, intro })
			break
		}
	}

	p.etag = null
	return null
}
