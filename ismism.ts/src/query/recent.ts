import { nrec } from "../db.ts";

export async function recent(
) {
	const rec = await nrec()
	return rec
}
