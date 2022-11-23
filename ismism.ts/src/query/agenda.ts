import { coll, nrec_of_aid } from "../db.ts"
import { dat_of_aid } from "./dat.ts"

export async function agenda(
) {
	const a = await coll.agenda.find().sort({ _id: -1 }).toArray()
	return Promise.all(a.map(async a => {
		const [nworker, nwork, nfund, dat] = await Promise.all([
			nrec_of_aid(coll.worker, a._id),
			nrec_of_aid(coll.work, a._id),
			nrec_of_aid(coll.fund, a._id),
			dat_of_aid(a._id),
		])
		return { ...a, nworker, nwork, nfund, dat }
	}))
}
