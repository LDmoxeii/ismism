import { coll, DocC, DocD, DocR, DocU, Update } from "../db.ts"
import { not_adm } from "../ont/adm.ts"
import { not_id, not_intro, not_nam } from "./id.ts"
import { Agd } from "./typ.ts"

export async function agd_c(
	nam: Agd["nam"],
	ref: Agd["_id"][],
	adm1: string,
	adm2: string,
	intro: string,
): DocC<Agd["_id"]> {
	if (not_nam(nam) || ref.some(not_id) || not_adm([adm1, adm2]) || not_intro(intro)) return null
	const l = await coll.agd.findOne({}, { projection: { _id: 1 }, sort: { _id: -1 } })
	const _id = l ? l._id + 1 : 1
	const a: Agd = {
		_id, nam, ref, adm1, adm2, intro,
		rej: [],
		utc: Date.now(),
		detail: "",
		budget: 0, fund: 0, expense: 0,
		goal: [],
		img: [],
		res_max: 0
	}
	try { return await coll.agd.insertOne(a) as Agd["_id"] }
	catch { return null }
}

export async function agd_r<
	P extends keyof Agd
>(
	aid: Agd["_id"],
	projection: Partial<{ [K in P]: 1 }>
): DocR<Pick<Agd, "_id" | P>> {
	if (not_id(aid)) return null
	return await coll.agd.findOne({ _id: aid }, { projection }) ?? null
}

function not_goal(
	g: Agd["goal"][0]
) {
	return not_nam(g.nam) || typeof g.pct !== "number" || g.pct < 0 || g.pct > 100
}
function not_img(
	i: Agd["img"][0]
) {
	return typeof i.nam !== "string" || typeof i.src !== "string"
}

export async function agd_u(
	_id: Agd["_id"],
	u: Update<Agd>,
): DocU {
	if (not_id(_id)) return null
	if ("$set" in u && u.$set) {
		const a = u.$set
		if (a.nam && not_nam(a.nam)) return null
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
		const { modifiedCount } = await coll.agd.updateOne({ _id }, u)
		return modifiedCount > 0 ? 1 : 0
	} catch { return null }
}


export async function agd_d(
	aid: Agd["_id"]
): DocD {
	if (not_id(aid)) return null
	try {
		const c = await coll.agd.deleteOne({ _id: aid })
		return c > 0 ? 1 : 0
	} catch { return null }
}

