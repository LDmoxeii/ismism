import { coll, nrec_of_uid } from "../db.ts"
import { User } from "../typ.ts"
import { soc_of_uid } from "./soc.ts"

async function user_of_uid(
	uid: number
): Promise<Pick<User, "name" | "utc"> | null> {
	if (uid === 0) return null
	const projection = { _id: 0, name: 1, utc: 1 }
	return await coll.user.findOne({ _id: uid }, { projection }) ?? null
}

export async function user(
	uid: number
) {
	if (uid === 0) return null
	const [u, soc, worker, work, fund] = await Promise.all([
		user_of_uid(uid),
		soc_of_uid(uid),
		nrec_of_uid(coll.worker, [uid]),
		nrec_of_uid(coll.work, [uid]),
		nrec_of_uid(coll.fund, [uid]),
	])
	if (u === null) return null
	return { ...u, soc, worker, work, fund }
}
