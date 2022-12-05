import { nrec_of_recent } from "../db.ts";

export async function recent(
) {
	const rec = await nrec_of_recent()
	return rec
}
