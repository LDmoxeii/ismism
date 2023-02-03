import { Ret } from "../ontic/typ.ts"
import { pass, Pass, pass_clear, pass_code, pass_issue } from "./pass.ts"
import { is_re, pro_agenda, pro_rec, pro_soc, pro_user } from "./pro.ts"

export type PassPost = { jwt?: string | null, pass?: Pass | null }
export type PassCode = Ret<typeof pass_code>

export async function post(
	p: PassPost,
	f: string,
	b: string,
) {
	let json
	try { json = b.length > 0 ? JSON.parse(b) : {} }
	catch { return null }

	if (p.jwt) {
		p.pass = await pass(p.jwt)
		p.jwt = null
	} else p.pass = null

	switch (f) {
		case "pass": {
			const { uid, sms, nbr, code } = json
			if (typeof uid === "number") {
				p.jwt = null
				if (p.pass && uid === p.pass.id.uid) {
					p.pass = null
					return pass_clear(uid)
				}
			} else if (typeof sms === "boolean" && typeof nbr === "string") {
				return await pass_code(nbr, sms)
			} else if (typeof nbr === "string" && typeof code === "number") {
				const issue = await pass_issue(nbr, code)
				if (issue) {
					p.pass = issue.pass
					p.jwt = issue.jwt
					return issue.pass
				}
			} else if (p.pass) return p.pass
			break
		}

		case "pro": {
			const { re, uid, sid, aid, rec, recid, pro } = json
			if (p.pass && is_re(re) && typeof pro === "boolean")
				if (typeof uid === "number") return pro_user(p.pass, re, uid, pro)
				else if (typeof sid === "number") return pro_soc(p.pass, re, sid, pro)
				else if (typeof aid === "number") return pro_agenda(p.pass, re, aid, pro)
				else if (typeof rec === "string" && typeof recid === "object") return pro_rec(p.pass, re, rec, recid, pro)
			break
		}
	}

	return null
}
