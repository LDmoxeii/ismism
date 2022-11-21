import { coll } from "../db.ts";
import { Soc } from "../typ.ts";

export async function soc_of_uid(
	uid: number
): Promise<Pick<Soc, "name" | "intro">[]> {
	if (uid === 0) return []
	return await coll.soc.find(
		// deno-lint-ignore no-explicit-any
		{ uid } as any,
		{ projection: { _id: 1, name: 1, intro: 1 } }
	).toArray()
}
