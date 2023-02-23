import { Coll, coll } from "../db.ts"
import { id_of_adm } from "../eid/id.ts"
import { agd, soc, usr } from "./doc.ts"

// deno-lint-ignore no-explicit-any
type Ret<T extends (...args: any) => any> = Awaited<ReturnType<T>>

export type Usr = Ret<typeof usr>
export type Soc = Ret<typeof soc>
export type Agd = Ret<typeof agd>

function id(
	c: Coll["soc" | "agd"],
	p: URLSearchParams,
) {
	const [adm1, adm2] = [p.get("adm1"), p.get("adm2")]
	return id_of_adm(c, adm2 ? { adm2 } : adm1 ? { adm1 } : undefined)
}

export async function que(
	f: string,
	p: URLSearchParams,
) {
	switch (f) {
		case "usr": {
			const uid = parseInt(p.get("uid") ?? "")
			return await usr(uid)
		} case "soc": {
			if (p.has("sid")) {
				const sid = parseInt(p.get("sid") ?? "")
				return await soc(sid)
			}
			const sid = await id(coll.soc, p)
			return await Promise.all(sid.map(soc))
		} case "agd": {
			if (p.has("aid")) {
				const aid = parseInt(p.get("aid") ?? "")
				return await agd(aid)
			}
			const aid = await id(coll.agd, p)
			return await Promise.all(aid.map(agd))
		} case "rec": {
			break
		}
	}
	return null
}
