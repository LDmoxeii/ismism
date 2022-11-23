import { coll } from "../db.ts"
import { dat_of_aid } from "./dat.ts"
import { nfund_of_aid } from "./fund.ts"
import { nwork_of_aid } from "./work.ts"
import { nworker_of_aid } from "./worker.ts"

export async function agenda(
) {
	const a = await coll.agenda.find().sort({ _id: -1 }).toArray()
	return Promise.all(a.map(async a => {
		const [nworker, nwork, nfund, dat] = await Promise.all([
			nworker_of_aid(a._id),
			nwork_of_aid(a._id),
			nfund_of_aid(a._id),
			dat_of_aid(a._id),
		])
		return { ...a, nworker, nwork, nfund, dat }
	}))
}
