import type { Ret } from "./con.ts"
import { coll } from "../db.ts"
import { agd, nid, rec, soc, usr } from "./doc.ts"
import { id } from "../eid/id.ts"
import { is_id } from "../eid/is.ts"

export type NId = Ret<typeof nid>
export type Usr = Ret<typeof usr>
export type Soc = Ret<typeof soc>
export type Agd = Ret<typeof agd>
export type Rec = Ret<typeof rec>

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
			const sid = await id(coll.soc, adm2 ? { adm2 } : adm1 ? { adm1 } : undefined)
			return await Promise.all(sid.map(soc))
		} case "agd": {
			if (p.has("aid")) return await agd(parseInt(p.get("aid") ?? ""))
			const [adm1, adm2] = [p.get("adm1"), p.get("adm2")]
			const aid = await id(coll.agd, adm2 ? { adm2 } : adm1 ? { adm1 } : undefined)
			return await Promise.all(aid.map(agd))
		} case "rec": {
			const c = p.get("c")
			const [utc, uid, sid, aid] = ["utc", "uid", "sid", "aid"].map(t => parseInt(p.get(t) ?? ""))
			const id = is_id(uid) ? { uid } : is_id(aid) ? { aid } : is_id(sid) ? { sid } : undefined
			if (utc >= 0) {
				if (c === "work") return await rec(coll.work, utc, id)
				else if (c === "fund") return await rec(coll.fund, utc, id)
			} break
		}
	}
	return null
}

