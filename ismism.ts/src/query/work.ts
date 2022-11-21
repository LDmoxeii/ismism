import { coll } from "../db.ts";
import { Work } from "../typ.ts";

export async function work_of_uid(
	uid: number
): Promise<Omit<Work, "uid">[]> {
	if (uid === 0) return []
	return await coll.work.find(
		{ uid },
		{ projection: { uid: 0 } }
	).toArray()
}
