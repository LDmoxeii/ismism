import { assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts"
import { coll, db } from "../src/db.ts"
import { agd_c, agd_u } from "../src/eid/agd.ts"
import { rec_c } from "../src/eid/rec.ts"
import { soc_c, soc_u } from "../src/eid/soc.ts"
import { usr_c } from "../src/eid/usr.ts"
import { Agd, que, Rec, Soc, Usr } from "../src/pra/que.ts"

await db("tst", true)
const utc = Date.now()

await Promise.all([
	await usr_c("11111111111", "四川", "成都"),
	await usr_c("11111111112", "广东", "汕头"),
	await usr_c("11111111113", "江苏", "苏州"),
	await soc_c("社团一", "四川", "成都"),
	await soc_c("社团二", "江苏", "苏州"),
	await soc_c("社团三", "江苏", "苏州"),
	await agd_c("活动一", "四川", "成都"),
	await agd_c("活动二", "江苏", "苏州"),
	await agd_c("活动三", "江苏", "苏州"),
	soc_u(1, { $set: { uid: [1, 2, 3] } }),
	soc_u(2, { $set: { uid: [3] } }),
	agd_u(1, { $set: { uid: [1, 2, 3] } }),
	agd_u(2, { $set: { uid: [3] } }),
	rec_c(coll.work, { _id: { uid: 1, aid: 1, utc }, rej: [], ref: [], work: "work", msg: "work" }),
	rec_c(coll.work, { _id: { uid: 1, aid: 2, utc }, rej: [], ref: [], work: "work", msg: "work" }),
	rec_c(coll.work, { _id: { uid: 2, aid: 1, utc: utc + 1 }, rej: [], ref: [], work: "video", nam: "nam", src: "src" }),
	rec_c(coll.fund, { _id: { uid: 1, aid: 1, utc }, fund: 100, msg: "fund" }),
	rec_c(coll.fund, { _id: { uid: 3, aid: 2, utc: utc + 1 }, fund: 100, msg: "fund" }),
])

export function p(
	obj: {
		c?: string,
		uid?: number,
		sid?: number,
		aid?: number,
		utc?: number,
		adm1?: string,
		adm2?: string,
	}
) {
	return new URLSearchParams(Object.entries(obj).map(([k, v]) => [k, `${v}`]))
}

Deno.test("nid", async () => {
	assertEquals(await que("nid", p({})), {
		adm1nsid: [["江苏", 2], ["四川", 1]],
		adm2nsid: [["苏州", 2], ["成都", 1]],
		adm1naid: [["江苏", 2], ["四川", 1]],
		adm2naid: [["苏州", 2], ["成都", 1]]
	})
})

Deno.test("usr", async () => {
	const u = await que("usr", p({ uid: 1 })) as Usr
	assertEquals(u!.nrec, { work: 2, fund: 1 })
})

Deno.test("soc", async () => {
	const s = await que("soc", p({})) as Soc[]
	assertEquals(s!.length, 3)
	assertEquals(s[2]?.nrec, { work: 3, fund: 2 })
	assertEquals(s[0]?.nrec, { work: 0, fund: 0 })
	const s1 = await que("soc", p({ sid: s[2]?._id })) as Soc
	assertEquals(s[2], s1)
})

Deno.test("agd", async () => {
	const a = await que("agd", p({})) as Agd[]
	assertEquals(a!.length, 3)
	assertEquals(a[1]?.nrec, { work: 1, fund: 1 })
	assertEquals(a[2]?.nrec, { work: 2, fund: 1 })
	const a1 = await que("agd", p({ aid: a[2]?._id })) as Agd
	assertEquals(a[2], a1)
})

Deno.test("rec", async () => {
	const work = await que("rec", p({ c: "work", utc: 0 })) as Rec
	const fund = await que("rec", p({ c: "fund", utc: 0 })) as Rec
	assertEquals(work!.rec.length, 3)
	assertEquals(fund!.rec.length, 2)
	const work_utc = await que("rec", p({ c: "work", utc })) as Rec
	const work_uid2 = await que("rec", p({ c: "work", utc: 0, uid: 2 })) as Rec
	const fund_aid2 = await que("rec", p({ c: "fund", utc: 0, aid: 2 })) as Rec
	const fund_sid2 = await que("rec", p({ c: "fund", utc: 0, sid: 2 })) as Rec
	assertEquals(work?.rec.slice(2), work_utc?.rec)
	assertEquals(work_utc, work_uid2)
	assertEquals(fund?.rec.slice(1), fund_aid2?.rec)
	assertEquals(fund_aid2, fund_sid2)
})
