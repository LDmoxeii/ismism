import { coll } from "../db.ts"
import { User } from "../typ.ts"
import { idname, not_id } from "./id.ts"
import { nrec_of_uid } from "./rec.ts"
import { soc_of_uid } from "./soc.ts"

async function user_of_uid(
	uid: number
): Promise<Pick<User, "name" | "utc" | "referer" | "intro"> | null> {
	if (not_id(uid)) return null
	const projection = { _id: 0, name: 1, utc: 1, referer: 1, intro: 1 }
	return await coll.user.findOne({ _id: uid }, { projection }) ?? null
}

export async function user(
	uid: number
) {
	if (not_id(uid)) return null
	const [u, soc, nrec] = await Promise.all([
		user_of_uid(uid),
		soc_of_uid(uid),
		nrec_of_uid([uid]),
	])
	if (u === null) return null
	const uname = await idname(coll.user, u.referer)
	return { ...u, soc, uname, nrec }
}
