import type { Ret } from "./can.ts"
import { is_id, is_nbr } from "../eid/is.ts"
import { coll } from "../db.ts"
import { agd, aut, dst, live, md, nid, ord, rec, soc, usr } from "./doc.ts"
import { id, idnam } from "../eid/id.ts"
import { nord_f } from "../eid/ord.ts"

export type NId = Ret<typeof nid>
export type Usr = Ret<typeof usr>
export type Soc = Ret<typeof soc>
export type Agd = Ret<typeof agd>
export type Ord = Ret<typeof ord>
export type Rec = Ret<typeof rec>
export type Live = Ret<typeof live>
export type Dst = Ret<typeof dst>
export type Aut = Ret<typeof aut>
export type Md = Ret<typeof md>

export async function que(
	f: string,
	p: URLSearchParams,
) {
	switch (f) {
		case "nid": {
			return await nid()
		} case "usr": {
			const uid = parseInt(p.get("uid") ?? "")
			return await usr(uid)
		} case "soc": {
			if (p.has("sid")) return await soc(parseInt(p.get("sid") ?? ""))
			const [adm1, adm2] = [p.get("adm1"), p.get("adm2")]
			return await idnam(coll.soc, await id(coll.soc, adm2 ? { adm2 } : adm1 ? { adm1 } : undefined))
		} case "agd": {
			if (p.has("aid")) return await agd(parseInt(p.get("aid") ?? ""))
			const [adm1, adm2] = [p.get("adm1"), p.get("adm2")]
			return await idnam(coll.agd, await id(coll.agd, adm2 ? { adm2 } : adm1 ? { adm1 } : undefined))
		} case "nord": {
			const [aid, utc] = ["aid", "utc"].map(t => parseInt(p.get(t) ?? ""))
			return await nord_f({ aid, utc })
		} case "ord": {
			const nbr = p.get("nbr")
			const [aid, utc] = ["aid", "utc"].map(t => parseInt(p.get(t) ?? ""))
			if (nbr && is_nbr(nbr)) return await ord({ nbr, utc })
			else if (is_id(aid)) return utc >= 0 ? await ord({ aid, utc }) : await ord({ aid })
			break
		} case "rec": {
			const c = p.get("c")
			const [utc, uid, sid, aid] = ["utc", "uid", "sid", "aid"].map(t => parseInt(p.get(t) ?? ""))
			if (utc >= 0) {
				const id = is_id(uid) && is_id(aid) ? { uid, aid }
					: is_id(uid) ? { uid } : is_id(aid) ? { aid } : is_id(sid) ? { sid } : undefined
				if (c === "work") return await rec(coll.work, utc, id)
				else if (c === "fund") return await rec(coll.fund, utc, id)
			} break
		} case "live": {
			return await live()
		} case "dst": {
			return await dst()
		} case "aut": {
			return await aut()
		} case "md": {
			const [wslid, litid] = ["wslid", "litid"].map(t => parseInt(p.get(t) ?? ""))
			const f = p.get("f") === null ? false : true
			if (wslid >= 0) return await md(coll.wsl, wslid, f)
			else if (litid >= 0) return await md(coll.lit, litid, f)
		}
	}
	return null
}
