import type { Ret } from "./con.ts"
import { utc_etag } from "../ont/utc.ts"
import { pas, Pas, pas_clear, pas_code, pas_issue } from "./pas.ts"
import { pre_agd, pre_fund, pre_soc, pre_usr, pre_work } from "./pre.ts"
import { pro_agd, pro_soc, pro_usr, pro_work } from "./pro.ts"
import { put_agd, put_soc, put_usr } from "./put.ts"

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

		case "pre": {
			p.etag = utc_etag()
			const { aid, actid, nbr, adm1, adm2, snam, anam, msg, nam, src } = json
			if (typeof adm1 === "string" && typeof adm2 === "string") {
				if (typeof nbr === "string") {
					if (typeof actid === "string") return pre_usr({ actid }, nbr, adm1, adm2)
					else if (p.pas) return pre_usr({ pas: p.pas }, nbr, adm1, adm2)
				} else if (p.pas) {
					if (typeof snam === "string") return pre_soc(p.pas, snam, adm1, adm2)
					else if (typeof anam === "string") return pre_agd(p.pas, anam, adm1, adm2)
				}
			} else if (typeof aid === "number" && p.pas) {
				if (typeof msg === "string") return pre_work(p.pas, aid, { msg })
				else if (typeof nam === "string" && typeof src === "string") return pre_work(p.pas, aid, { nam, src })
			} else if (typeof actid === "string" && p.pas) return pre_fund(p.pas, actid)
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

		case "put": {
			if (!p.pas) break
			p.etag = utc_etag()
			const { nam, adm1, adm2, sid, aid, uidlim, intro, reslim, account, budget, fund, expense, rel, add, uid } = json
			if (typeof nam === "string" && typeof adm1 === "string" && typeof adm2 === "string") {
				if (typeof intro === "string") return put_usr(p.pas, { nam, adm1, adm2, intro })
				else if (typeof uidlim === "number") {
					if (typeof sid === "number") return put_soc(p.pas, sid, { nam, adm1, adm2, uidlim })
					else if (typeof aid === "number") return put_agd(p.pas, aid, { nam, adm1, adm2, uidlim })
				}
			} else if (typeof intro === "string" && typeof reslim === "number") {
				if (typeof sid === "number") return put_soc(p.pas, sid, { intro, reslim })
				else if (typeof aid === "number" && typeof account === "string" && typeof budget === "number" && typeof fund === "number" && typeof expense === "number")
					return put_agd(p.pas, aid, { intro, reslim, account })
			} else if (typeof rel === "string") {
				const r = rel as "sec" | "uid" | "res"
				if (typeof add === "boolean" && typeof uid === "number") {
					if (typeof sid === "number") return put_soc(p.pas, sid, { rel: r, add, uid })
					else if (typeof aid === "number") return put_agd(p.pas, aid, { rel: r, add, uid })
				} else {
					if (typeof sid === "number") return put_soc(p.pas, sid, { rel: r })
					else if (typeof aid === "number") return put_agd(p.pas, aid, { rel: r })
				}
			}
			break
		}
	}

	p.etag = null
	return null
}
