import { nrec } from "./rec.ts"

export async function recent(
) {
	const rec = await nrec()
	return rec
}
