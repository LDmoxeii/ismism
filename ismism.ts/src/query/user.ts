import { coll, idname } from "../db.ts"
import { User } from "../typ.ts"
import { fund_of_uid } from "./fund.ts"
import { soc_of_uid } from "./soc.ts"
import { work_of_uid } from "./work.ts"
import { worker_of_uid } from "./worker.ts"

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
		worker_of_uid([uid]),
		work_of_uid([uid]),
		fund_of_uid([uid]),
	])
	if (u === null) return null
	const aname = await idname(coll.agenda, [
		...worker.map(w => w._id.aid),
		...work.map(w => w._id.aid),
		...fund.map(f => f._id.aid),
	])
	return { ...u, soc, work, fund, aname }
}
