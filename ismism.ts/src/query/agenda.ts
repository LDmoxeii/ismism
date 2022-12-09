import { coll, nrec_of_aid, nrec } from "../db.ts"
import { dat_of_aid } from "./dat.ts"

export async function agenda(
) {
	const [rec, a] = await Promise.all([
		nrec(),
		await coll.agenda.find().sort({ _id: -1 }).toArray()
	])
	const agenda = await Promise.all(a.map(async a => {
		const [rec, dat] = await Promise.all([
			nrec_of_aid(a._id),
			dat_of_aid(a._id),
		])
		return { ...a, rec, dat }
	}))
	return { rec, agenda }
}
