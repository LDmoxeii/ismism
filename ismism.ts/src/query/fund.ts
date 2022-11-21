import { coll } from "../db.ts";
import { Fund } from "../typ.ts";

export async function fund_of_uid(
	uid: number
): Promise<Omit<Fund, "uid">[]> {
	if (uid === 0) return []
	return await coll.fund.find(
		{ uid },
		{ projection: { uid: 0 } }
	).toArray()
}
