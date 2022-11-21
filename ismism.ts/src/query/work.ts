import { coll } from "../db.ts";
import { Work } from "../typ.ts";

export function work_of_uid(
	uid: number[]
): Promise<Work[]> {
	return coll.work.find({ uid: { "$in": uid } }).toArray()
}
