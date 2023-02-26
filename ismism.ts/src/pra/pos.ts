import { pas, Pas, pas_clear, pas_code, pas_issue } from "./pas.ts"

// deno-lint-ignore no-explicit-any
type Ret<T extends (...args: any) => any> = Awaited<ReturnType<T>>

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
	}

	p.etag = null
	return null
}
