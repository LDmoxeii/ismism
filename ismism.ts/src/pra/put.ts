import { DocU } from "../db.ts"
import { soc_r, soc_u } from "../eid/soc.ts"
import { Soc, Usr } from "../eid/typ.ts"
import { usr_r, usr_u } from "../eid/usr.ts"
import { not_aut, not_pro } from "./con.ts"
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
	s: Pick<Soc, "nam" | "adm1" | "adm2" | "intro" | "sec" | "uid_max">,
): DocU {
	if (not_pro(pas)) return null
	const na = not_aut(pas.aut, "pre_soc")
	const sec = await soc_r(sid, { sec: 1 })
	if (!sec || na && !sec.sec.includes(pas.id.uid)) return null
	return await soc_u(sid, { $set: na ? { intro: s.intro } : s })
}

export async function put_soc_res(
	pas: Pas,
	sid: Soc["_id"],
	res: boolean,
): DocU {
	if (not_pro(pas)) return null
	const s = await soc_r(sid, { uid: 1 })
	if (!s || s.uid.includes(pas.id.uid)) return null
	return await soc_u(sid, res
		? { $addToSet: { res: pas.id.uid } }
		: { $pull: { res: pas.id.uid } }
	)
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
