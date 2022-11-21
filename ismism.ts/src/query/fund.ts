import { coll } from "../db.ts";
import { Fund } from "../typ.ts";

export function fund_of_uid(
	uid: number[]
): Promise<Fund[]> {
	return coll.fund.find({ uid: { "$in": uid } }).toArray()
}
