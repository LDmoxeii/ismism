import { agd_r } from "../eid/agd.ts";
import { coll } from "../eid/db.ts";
import { id, idadm, idnam } from "../eid/id.ts";
import { cdt_a, rec_f, rec_n, rec_s } from "../eid/rec.ts";
import { soc_r } from "../eid/soc.ts";
import { Agd, Rec, Soc, Usr } from "../eid/typ.ts";
import { usr_r } from "../eid/usr.ts";

export async function adm(
) {
    const [adm1, adm2] = await Promise.all([idadm("adm1"), idadm("adm2")])
    const soc = await idnam(coll.soc, adm1.flatMap(a => a[1]))
    soc.sort((a, b) => a[0] - b[0])
    return { adm1, adm2, soc }
}

export async function usr(
    f: Pick<Usr, "_id"> | Pick<Usr, "nam">,
) {
    const u = await usr_r(f, { _id: 1, utc: 1, nam: 1, adm1: 1, adm2: 1, msg: 1 })
    if (!u) return null
    const now = Date.now()
    const [sec, cdt, ern, cdt_n, dbt_n, ern_n] = await Promise.all([ // deno-lint-ignore no-explicit-any
        idnam(coll.soc, await id(coll.soc, { sec: u._id } as any)),
        rec_f(coll.cdt, { usr: u._id }, { now }),
        rec_s(coll.ern, { usr: u._id }, {}),
        rec_n(coll.cdt, { usr: u._id }, {}),
        rec_n(coll.dbt, { usr: u._id }, {}),
        rec_n(coll.ern, { usr: u._id }, {}),
    ])
    const [dbt, soc] = await Promise.all([
        Promise.all(cdt.map(c => rec_s(coll.dbt, { usr: c._id.usr, soc: c._id.soc }, { frm: c.utc.eft }))),
        idnam(coll.soc, [...cdt.map(c => c._id.soc), ...ern.map(r => r.soc)]).then(n => new Map(n)),
    ])
    return {
        ...u, sec,
        cdt: cdt.map((c, n) => ({
            nam: soc.get(c._id.soc)!,
            soc: c._id.soc,
            amt: cdt_a(c) - (dbt[n].length == 0 ? 0 : dbt[n][0].amt)
        })).sort((a, b) => b.amt - a.amt),
        ern: ern.map(n => ({ ...n, nam: soc.get(n.soc)! })).sort((a, b) => b.amt - a.amt),
        sum: { cdt: cdt_n, dbt: dbt_n, ern: ern_n },
    }
}

export async function soc(
    soc: Soc["_id"]
) {
    const [s, a, c, dbt_s, ern_s] = await Promise.all([
        soc_r(soc), id(coll.agd, { soc }),
        rec_f(coll.cdt, { soc }, { now: Date.now() }),
        rec_s(coll.dbt, { soc }, {}),
        rec_s(coll.ern, { soc }, {}),
    ])
    if (!s) return null
    const [sec, cdt, agd] = await Promise.all([
        idnam(coll.usr, s.sec),
        idnam(coll.usr, c.map(c => c._id.usr)),
        idnam(coll.agd, a),
    ])
    return {
        ...s, sec, cdt, agd, sum: {
            cdt: c.reduce((s, c) => s + cdt_a(c), 0),
            dbt: dbt_s[0] ? dbt_s[0].amt : 0,
            ern: ern_s[0] ? ern_s[0].amt : 0,
        }
    }
}

export async function agd(
    agd: Agd["_id"],
) {
    const a = await agd_r(agd)
    if (!a) return null
    const [soc] = await idnam(coll.soc, [a.soc])
    return { ...a, soc }
}

export async function rec(
    q: "cdt" | "dbt" | "ern",
    id: { usr: Rec["_id"]["usr"] } | { soc: Rec["_id"]["soc"] },
    utc: Rec["_id"]["utc"],
) {
    const r = await rec_f(coll[q], id, { to: utc })
    const [usr, soc] = await Promise.all([
        idnam(coll.usr, r.flatMap(({ _id: { usr }, sec }) => sec ? [usr, sec] : [usr])),
        idnam(coll.soc, r.map(r => r._id.soc)),
    ])
    return { rec: r, usr, soc }
}