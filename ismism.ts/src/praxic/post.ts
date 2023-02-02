import { Ret } from "../ontic/typ.ts"
import { pass, Pass, pass_clear, pass_code, pass_issue } from "./pass.ts"
import { is_re, pro_agenda, pro_soc, pro_user } from "./pro.ts"

export type PassPost = { jwt?: string | null, pass?: Pass | null }
export type PassCode = Ret<typeof pass_code>

export async function post(
	p: PassPost,
	f: string,
	b: string,
) {
	if (p.jwt) {
		p.pass = await pass(p.jwt)
		p.jwt = null
	} else p.pass = null
	switch (f) {
		case "pass": {
			if (p.pass) return p.pass
			break
		} case "pass_issue": {
			const { nbr, code } = JSON.parse(b)
			if (typeof nbr === "string" && typeof code === "number") {
				const issue = await pass_issue(nbr, code)
				if (issue) {
					p.pass = issue.pass
					p.jwt = issue.jwt
					return issue.pass
				}
			}
			break
		} case "pass_code": {
			const { nbr, sms } = JSON.parse(b)
			if (typeof nbr === "string" && typeof sms === "boolean")
				return await pass_code(nbr, sms)
			break
		} case "pass_clear": {
			p.jwt = null
			if (p.pass) {
				const uid = p.pass.id.uid
				p.pass = null
				return pass_clear(uid)
			}
			break
		}

		case "pro": {
			const { re, uid, sid, aid, pro } = JSON.parse(b)
			if (p.pass && is_re(re) && typeof pro === "boolean")
				if (typeof uid === "number") return pro_user(p.pass, re, uid, pro)
				else if (typeof sid === "number") return pro_soc(p.pass, re, sid, pro)
				else if (typeof aid === "number") return pro_agenda(p.pass, re, aid, pro)
			break
		}
	}
	return null
}
