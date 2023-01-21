import { Ret } from "./ontic/typ.ts"
import { agenda } from "./query/agenda.ts"
import { collrec, rec_of_aid, rec_of_recent, rec_of_sid, rec_of_uid } from "./query/rec.ts"
import { soc } from "./query/soc.ts"
import { user, UserPass, userpass, userpass_clear, userpass_code, userpass_issue, user_new } from "./query/user.ts"

export type Agenda = Ret<typeof agenda>
export type User = Ret<typeof user>
export type Soc = Ret<typeof soc>

export async function query(
	f: string,
	p: URLSearchParams,
) {
	switch (f) {
		case "agenda": {
			return await agenda()
		} case "user": {
			const uid = parseInt(p.get("uid") ?? "")
			return await user(uid)
		} case "soc": {
			const sid = parseInt(p.get("sid") ?? "")
			return await soc(sid)
		} case "rec_of_recent": {
			const coll = collrec(p.get("coll") ?? "")
			const utc = parseFloat(p.get("utc") ?? "")
			if (coll && utc > 0) return await rec_of_recent(coll, utc, 1000)
			break
		} case "rec_of_aid": {
			const coll = collrec(p.get("coll") ?? "")
			const aid = parseInt(p.get("aid") ?? "")
			if (coll && aid > 0) return await rec_of_aid(coll, aid)
			break
		} case "rec_of_uid": {
			const coll = collrec(p.get("coll") ?? "")
			const uid = parseInt(p.get("uid") ?? "")
			if (coll && uid > 0) return await rec_of_uid(coll, [uid])
			break
		} case "rec_of_sid": {
			const coll = collrec(p.get("coll") ?? "")
			const sid = parseInt(p.get("sid") ?? "")
			if (coll && sid > 0) return await rec_of_sid(coll, sid)
			break
		}
	}
	return null
}

export type PostPass = { jwt?: string | null, u?: UserPass | null }
export type UserPassCode = Ret<typeof userpass_code>
export type UserPassClear = Ret<typeof userpass_clear>

export async function post(
	f: string,
	p: PostPass,
	b: string,
) {
	if (p.jwt) {
		p.u = await userpass(p.jwt)
		p.jwt = undefined
	}
	switch (f) {
		case "usernew": {
			const { act, nbr } = JSON.parse(b)
			if (typeof act == "string" && typeof nbr == "string") {
				return user_new(act, nbr)
			}
			break
		} case "userpass": {
			if (p.u) return p.u
			break
		} case "userpass_clear": {
			p.jwt = undefined
			if (p.u) {
				const uid = p.u.uid
				p.u = undefined
				return userpass_clear(uid)
			}
			break
		} case "userpass_issue": {
			const { nbr, code, renew } = JSON.parse(b)
			if (typeof nbr === "string" && typeof code === "number" && typeof renew === "boolean") {
				const u = await userpass_issue(nbr, code, renew)
				if (u) {
					p.jwt = u.jwt
					p.u = u.u
					return u.u
				}
			}
			break
		} case "userpass_code": {
			const { nbr, sms } = JSON.parse(b)
			if (typeof nbr === "string" && typeof sms === "boolean") {
				const u = await userpass_code(nbr, sms)
				if (u) return u
			}
			break
		}
	}
	return null
}
