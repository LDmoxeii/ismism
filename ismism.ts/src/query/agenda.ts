import { coll } from "../db.ts"
import { dat } from "./dat.ts"
import { nrec, nrec_of_aid } from "./rec.ts"

export async function agenda(
) {
	const [nr, a] = await Promise.all([
		nrec(),
		await coll.agenda.find().sort({ _id: -1 }).toArray()
	])
	const agenda = await Promise.all(a.map(async a => {
		const [nr, imgsrc] = await Promise.all([
			nrec_of_aid(a._id),
			dat(coll.imgsrc, a.imgsrc),
		])
		return { ...a, nrec: nr, imgsrc }
	}))
	return { nrec: nr, agenda }
}
