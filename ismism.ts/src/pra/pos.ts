import type { PutAgd, PutSoc, Ret } from "./can.ts"
import type { Re } from "../eid/typ.ts"
import { utc_etag } from "../ont/utc.ts"
import { pas, Pas, pas_clear, pas_code, pas_issue } from "./pas.ts"
import { pre_agd, pre_aut, pre_dst, pre_fund, pre_lit, pre_ord, pre_soc, pre_usr, pre_work, pre_wsl } from "./pre.ts"
import { pro_agd, pro_soc, pro_usr, pro_work } from "./pro.ts"
import { put_agd, put_dst, put_lit, put_ord, put_soc, put_usr, put_work, put_wsl } from "./put.ts"

export type PasPos = {
	jwt?: string | null,
	pas?: Pas | null,
	etag?: string | null,
}
export type Pos = "pas" | "pre" | "pro" | "put"
export type { Pas } from "./pas.ts"
export type PasCode = Ret<typeof pas_code>
export type PreUsr = Ret<typeof pre_usr>

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
			const { uid, aid, rd, actid, nbr, sms, adm1, adm2, snam, anam, msg, nam, src, utcs, utce, aut, wslnam, litnam } = json
			if (typeof adm1 === "string" && typeof adm2 === "string") {
				if (typeof nbr === "string") {
					if (typeof actid === "string") return pre_usr({ actid }, nbr, adm1, adm2)
					else if (p.pas) return pre_usr({ pas: p.pas }, nbr, adm1, adm2)
				} else if (p.pas) {
					if (typeof snam === "string") return pre_soc(p.pas, snam, adm1, adm2)
					else if (typeof anam === "string") return pre_agd(p.pas, anam, adm1, adm2)
				}
			} else if (typeof rd === "number" && p.pas) {
				if (typeof aid === "number" && typeof uid === "number") return pre_dst(p.pas, { rd, aid, uid })
				else if (typeof aid === "number") return pre_dst(p.pas, { rd, aid })
				else if (typeof uid === "number") return pre_dst(p.pas, { rd, uid })
			} else if (typeof aid === "number") {
				if (typeof nbr === "string" && typeof sms === "boolean" && typeof msg === "string") return pre_ord(nbr, aid, msg, sms)
				else if (!p.pas) break
				else if (typeof msg === "string") return pre_work(p.pas, aid, { msg })
				else if (typeof nam === "string" && typeof src === "string") {
					if (typeof utcs === "number" && typeof utce === "number")
						return pre_work(p.pas, aid, { nam, src, utcs, utce })
					else return pre_work(p.pas, aid, { nam, src })
				}
			} else if (typeof actid === "string" && p.pas) return pre_fund(p.pas, actid)
			else if (typeof nam === "string" && ["aud", "aut", "wsl", "lit"].includes(aut) && p.pas) return pre_aut(p.pas, nam, aut)
			else if (typeof wslnam === "string" && p.pas) return pre_wsl(p.pas, wslnam)
			else if (typeof litnam === "string" && p.pas) return pre_lit(p.pas, litnam)
			break
		}

		case "pro": {
			p.etag = utc_etag()
			const { re, uid, sid, aid, workid, add } = json
			if (p.pas && typeof re === "string" && typeof add === "boolean") {
				const r = re as keyof Re
				if (typeof uid === "number") return pro_usr(p.pas, r, uid, add)
				else if (typeof sid === "number") return pro_soc(p.pas, r, sid, add)
				else if (typeof aid === "number") return pro_agd(p.pas, r, aid, add)
				else if (typeof workid === "object" && Object.keys(workid).length === 3)
					return pro_work(p.pas, r, workid, add)
			}
			break
		}

		case "put": {
			if (!p.pas) break
			p.etag = utc_etag()
			const {
				sid, aid, ordid, workid, wslid, litid,
				nam, adm1, adm2, intro, ord, md, pin,
				uidlim, reslim, account, budget, fund, expense, ordlim, ordlimw,
				goal, img, rol, add, uid, msg, src, utcs, utce, rd,
			} = json
			if (typeof nam === "string" && typeof adm1 === "string" && typeof adm2 === "string") {
				if (typeof intro === "string") return put_usr(p.pas, { nam, adm1, adm2, intro })
				else if (typeof uidlim === "number") {
					if (typeof sid === "number") return put_soc(p.pas, sid, { nam, adm1, adm2, uidlim })
					else if (typeof aid === "number") return put_agd(p.pas, aid, { nam, adm1, adm2, uidlim })
				}
			} else if (typeof intro === "string" && typeof reslim === "number") {
				if (typeof sid === "number") return put_soc(p.pas, sid, { intro, reslim })
				else if (typeof aid === "number" && typeof account === "string" && typeof budget === "number" && typeof fund === "number" && typeof expense === "number")
					return put_agd(p.pas, aid, { intro, reslim, account, budget, fund, expense })
			} else if (typeof rol === "string") {
				if (typeof add === "boolean" && typeof uid === "number") {
					if (typeof sid === "number") return put_soc(p.pas, sid, { rol, add, uid } as PutSoc)
					else if (typeof aid === "number") return put_agd(p.pas, aid, { rol, add, uid } as PutAgd)
				} else if (typeof add === "boolean") {
					if (typeof sid === "number") return put_soc(p.pas, sid, { rol, add } as PutSoc)
					else if (typeof aid === "number") return put_agd(p.pas, aid, { rol, add } as PutAgd)
				}
			} else if (typeof ordid === "object" && Object.keys(ordid).length === 3) {
				if (typeof ord === "boolean") return put_ord(p.pas, ordid, { ord })
				else return put_ord(p.pas, ordid, null)
			} else if (typeof workid === "object" && Object.keys(workid).length === 3) {
				if (typeof msg === "string") return put_work(p.pas, workid, { msg })
				else if (typeof nam === "string" && typeof src === "string") {
					if (typeof utcs === "number" && typeof utce === "number")
						return put_work(p.pas, workid, { nam, src, utcs, utce })
					else return put_work(p.pas, workid, { nam, src })
				} else return put_work(p.pas, workid, null)
			} else if (typeof rd === "string") {
				return put_dst(p.pas, rd)
			} if (typeof aid === "number") {
				if (typeof goal === "object") return put_agd(p.pas, aid, { goal })
				else if (typeof img === "object") return put_agd(p.pas, aid, { img })
				else if (typeof ordlim === "number" && typeof ordlimw === "number")
					return put_agd(p.pas, aid, { ordlim, ordlimw })
				else return put_agd(p.pas, aid, null)
			} else if (typeof sid === "number") return put_soc(p.pas, sid, null)
			else if (typeof wslid === "number") {
				if (typeof nam === "string" && typeof md === "string") return put_wsl(p.pas, wslid, { nam, md })
				else if (typeof pin === "boolean") return put_wsl(p.pas, wslid, { pin })
				else return put_wsl(p.pas, wslid, null)
			} else if (typeof litid === "number") {
				if (typeof nam === "string" && typeof md === "string") return put_lit(p.pas, litid, { nam, md })
				else if (typeof pin === "boolean") return put_lit(p.pas, litid, { pin })
				else return put_lit(p.pas, litid, null)
			}
			break
		}
	}

	p.etag = null
	return null
}
