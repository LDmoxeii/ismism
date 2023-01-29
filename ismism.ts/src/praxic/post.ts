import { Ret } from "../ontic/typ.ts"
import { pass, Pass, pass_clear, pass_code, pass_issue } from "./pass.ts"

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
			if (typeof nbr === "string" && typeof sms === "boolean") {
				return await pass_code(nbr, sms)
			}
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
	}
	return null
}
