import { coll } from "../eid/db.ts"
import { id, idnam } from "../eid/id.ts"
import { cdt_a, rec_s } from "../eid/rec.ts"
import { Usr } from "../eid/typ.ts"
import { usr_r } from "../eid/usr.ts"

export async function usr(
	f: Pick<Usr, "_id"> | Pick<Usr, "nam">,
) {
	const u = await usr_r(f, { _id: 1, utc: 1, nam: 1, adm1: 1, adm2: 1, msg: 1 })
	if (!u) return null
	const [sec, cdt, cdt_s, dbt_s, ern_s] = await Promise.all([ // deno-lint-ignore no-explicit-any
		id(coll.soc, { sec: u._id } as any),
		cdt_a({ usr: u._id }, { now: Date.now() }, { amt: 1, utc: 1 }),
		rec_s(coll.cdt, { usr: u._id }, {}),
		rec_s(coll.dbt, { usr: u._id }, {}),
		rec_s(coll.ern, { usr: u._id }, {}),
	])
	const [dbt, soc] = await Promise.all([
		Promise.all(cdt.map(c => rec_s(coll.dbt, { usr: c._id.usr, soc: c._id.soc }, { frm: c.utc.eft }))),
		idnam(coll.soc, [...sec, ...cdt_s.map(c => c.soc), ...dbt_s.map(d => d.soc), ...ern_s.map(e => e.soc)]),
	])
	return {
		...u, sec, soc,
		cdt: cdt.map(({ _id, amt, utc }, n) => ({ soc: _id.soc, amt: amt - (dbt[n].length == 0 ? 0 : dbt[n][0].amt), utc })),
		sum: { cdt: cdt_s, dbt: dbt_s, ern: ern_s },
	}
}
