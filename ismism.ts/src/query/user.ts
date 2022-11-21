import { coll, idname } from "../db.ts";
import { User } from "../typ.ts";
import { fund_of_uid } from "./fund.ts";
import { soc_of_uid } from "./soc.ts";
import { work_of_uid } from "./work.ts";

export async function user(
	uid: number
): Promise<Pick<User, "name" | "utc"> | null> {
	if (uid === 0) return null
	const projection = { name: 1, utc: 1 }
	return await coll.user.findOne({ _id: uid }, { projection }) ?? null
}

export async function user_profile(
	uid: number
) {
	if (uid === 0) return null
	const [u, soc, work, fund] = await Promise.all([
		user(uid),
		soc_of_uid(uid),
		work_of_uid(uid),
		fund_of_uid(uid),
	])
	if (u === null) return null
	const aidname = await idname(coll.agenda,
		work.map(w => w.aid).flat().concat(fund.map(f => f.aid))
	)
	return { ...u, soc, work, fund, aidname }
}
export type UserProfile = Awaited<ReturnType<typeof user_profile>>
