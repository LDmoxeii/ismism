import { coll, DocC, DocD, DocR, DocU, Update } from "../db.ts"
import { not_adm } from "../ontic/adm.ts"
import { not_id, not_intro, not_name } from "./id.ts"
import { Agenda } from "./dbtyp.ts"

export async function agenda_c(
	name: Agenda["name"],
	ref: Agenda["_id"][],
	adm1: string,
	adm2: string,
	intro: string,
): DocC<Agenda["_id"]> {
	if (not_name(name) || ref.some(not_id) || not_adm([adm1, adm2]) || not_intro(intro)) return null
	const l = await coll.agenda.findOne({}, { projection: { _id: 1 }, sort: { _id: -1 } })
	const _id = l ? l._id + 1 : 1
	const a: Agenda = {
		_id, name, ref, adm1, adm2, intro,
		rej: [],
		utc: Date.now(),
		detail: "",
		budget: 0, fund: 0, expense: 0,
		goal: [],
		img: [],
		res_max: 0
	}
	try { return await coll.agenda.insertOne(a) as Agenda["_id"] }
	catch { return null }
}

export async function agenda_r<
	P extends keyof Agenda
>(
	aid: Agenda["_id"],
	projection: Partial<{ [K in P]: 1 }>
): DocR<Pick<Agenda, "_id" | P>> {
	if (not_id(aid)) return null
	return await coll.agenda.findOne({ _id: aid }, { projection }) ?? null
}

function not_goal(
	g: Agenda["goal"][0]
) {
	return not_name(g.name) || typeof g.pct !== "number" || g.pct < 0 || g.pct > 100
}
function not_img(
	i: Agenda["img"][0]
) {
	return typeof i.name !== "string" || typeof i.src !== "string"
}

export async function agenda_u(
	_id: Agenda["_id"],
	u: Update<Agenda>,
): DocU {
	if (not_id(_id)) return null
	if ("$set" in u && u.$set) {
		const a = u.$set
		if (a.name && not_name(a.name)) return null
		if (a.ref && a.ref.some(not_id)) return null
		if ((a.adm1 || a.adm2) && not_adm([a.adm1, a.adm2])) return null
		if (a.intro && not_intro(a.intro)) return null
		if (a.budget && a.budget < 0) return null
		if (a.fund && a.fund < 0) return null
		if (a.expense && a.expense < 0) return null
		if (a.goal && a.goal.some(not_goal)) return null
		if (a.img && a.img.some(not_img)) return null
		if (a.candidate && a.candidate < 0) return null
	}
	try {
		const { modifiedCount } = await coll.agenda.updateOne({ _id }, u)
		return modifiedCount > 0 ? 1 : 0
	} catch { return null }
}


export async function agenda_d(
	aid: Agenda["_id"]
): DocD {
	if (not_id(aid)) return null
	try {
		const c = await coll.agenda.deleteOne({ _id: aid })
		return c > 0 ? 1 : 0
	} catch { return null }
}

