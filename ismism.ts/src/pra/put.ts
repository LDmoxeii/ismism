import { DocU } from "../db.ts"
import { agd_r, agd_u } from "../eid/agd.ts"
import { not_id } from "../eid/is.ts"
import { soc_r, soc_u } from "../eid/soc.ts"
import { Agd, Soc, Usr } from "../eid/typ.ts"
import { usr_r, usr_u } from "../eid/usr.ts"
import { goal_max, not_aut, not_pro } from "./con.ts"
import { Pas } from "./pas.ts"

export async function put_usr(
	pas: Pas,
	uid: Usr["_id"],
	u: Pick<Usr, "nam" | "adm1" | "adm2" | "intro">
): DocU {
	if (pas.id.uid !== uid) return null
	return await usr_u(uid, { $set: u })
}

export async function put_soc(
	pas: Pas,
	sid: Soc["_id"],
	s: Pick<Soc, "nam" | "adm1" | "adm2" | "intro" | "reslim">,
): DocU {
	if (not_pro(pas)) return null
	const na = not_aut(pas.aut, "pre_soc")
	const sec = await soc_r(sid, { sec: 1 })
	if (!sec || na && !sec.sec.includes(pas.id.uid)) return null
	return await soc_u(sid, { $set: na ? { intro: s.intro, reslim: s.reslim, } : s })
}

export async function put_agd(
	pas: Pas,
	aid: Agd["_id"],
	a: Pick<Agd, "nam" | "adm1" | "adm2" | "intro" | "reslim" | "detail">,
): DocU {
	const na = not_aut(pas.aut, "pre_agd")
	if (na && !pas.aid.sec.includes(aid) || not_pro(pas)) return null
	return await agd_u(aid, { $set: na ? { intro: a.intro, reslim: a.reslim, detail: a.detail } : a })
}

export async function put_soc_sec(
	pas: Pas,
	sid: Soc["_id"],
	uid: Usr["_id"],
	sec: boolean,
): DocU {
	if (not_id(uid) || not_aut(pas.aut, "pre_soc") || not_pro(pas)) return null
	return await soc_u(sid, sec ? { $addToSet: { sec: uid } } : { $pull: { sec: uid } })
}

export async function put_soc_res(
	pas: Pas,
	sid: Soc["_id"],
	res: boolean,
): DocU {
	if (not_pro(pas)) return null
	const s = await soc_r(sid, { uid: 1 })
	if (!s || s.uid.includes(pas.id.uid)) return null
	return await soc_u(sid, res ? { $addToSet: { res: pas.id.uid } } : { $pull: { res: pas.id.uid } })
}

export async function put_soc_uid(
	pas: Pas,
	sid: Soc["_id"],
	uid: Usr["_id"],
	pro: boolean,
): DocU {
	if (not_pro(pas)) return null
	const [s, u] = await Promise.all([
		soc_r(sid, { sec: 1, uid: 1, res: 1 }),
		usr_r({ _id: uid }, { rej: 1, ref: 1 }),
	])
	if (!s || !u) return null
	if (pro && s.res.includes(uid)
		&& u.rej.length < 2
		&& u.ref.filter(r => s.sec.includes(r)).length >= 2
		&& s.sec.includes(pas.id.uid)
	) return await soc_u(sid, { $addToSet: { uid }, $pull: { res: uid } })
	if (!pro && (s.uid.includes(uid) && uid === pas.id.uid
		|| s.res.includes(uid) && s.sec.includes(pas.id.uid)
	)) return await soc_u(sid, { $pull: { uid, res: uid } })
	return null
}

export async function put_agd_goal(
	pas: Pas,
	aid: Agd["_id"],
	goal: Agd["goal"][0]["nam"],
	pct?: Agd["goal"][0]["pct"],
): DocU {
	if (!pas.aid.sec.includes(aid) || not_pro(pas)) return null
	const a = await agd_r(aid, { goal: 1 })
	if (!a) return null
	if (pct === undefined) a.goal = a.goal.filter(g => g.nam !== goal).slice(0, goal_max)
	else {
		const n = a.goal.findIndex(g => g.nam === goal)
		if (n >= 0) a.goal[n].pct = pct
		else if (a.goal.length >= goal_max) return null
		else a.goal.push({ nam: goal, pct })
	}
	return await agd_u(aid, { $set: { goal: a.goal.sort((a, b) => a.pct - b.pct) } })
}
