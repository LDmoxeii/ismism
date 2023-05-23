import { assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts"
import { coll, db } from "../src/db.ts"
import { agd_c, agd_u } from "../src/eid/agd.ts"
import { rec_c } from "../src/eid/rec.ts"
import { md_c } from "../src/eid/md.ts"
import { soc_c, soc_u } from "../src/eid/soc.ts"
import { usr_c } from "../src/eid/usr.ts"
import { Agd, Md, Ord, que, Rec, Soc, Usr } from "../src/pra/que.ts"
import { ord_c } from "../src/eid/ord.ts"

await db("tst", true)
const utc = Date.now()

await Promise.all([
	await usr_c("11111111111", "四川", "成都"),
	await usr_c("11111111112", "广东", "汕头"),
	await usr_c("11111111113", "江苏", "苏州"),
	await soc_c("小组一", "四川", "成都"),
	await soc_c("小组二", "江苏", "苏州"),
	await soc_c("小组三", "江苏", "苏州"),
	await agd_c("活动一", "四川", "成都"),
	await agd_c("活动二", "江苏", "苏州"),
	await agd_c("活动三", "江苏", "苏州"),
	soc_u(1, { $set: { uid: [1, 2, 3] } }),
	soc_u(2, { $set: { uid: [3] } }),
	agd_u(1, { $set: { uid: [1, 2, 3] } }),
	agd_u(2, { $set: { uid: [3] } }),
	ord_c({ _id: { nbr: "11111111111", aid: 1, utc }, code: 1, ord: false, msg: "msg" }),
	ord_c({ _id: { nbr: "11111111111", aid: 2, utc: utc + 500 }, code: 1, ord: false, msg: "msg" }),
	ord_c({ _id: { nbr: "11111111112", aid: 2, utc: utc + 1000 }, code: 1, ord: true, msg: "msg" }),
	rec_c(coll.work, { _id: { uid: 1, aid: 1, utc }, rej: [], ref: [], work: "work", msg: "work" }),
	rec_c(coll.work, { _id: { uid: 1, aid: 2, utc }, rej: [], ref: [], work: "work", msg: "work" }),
	rec_c(coll.work, { _id: { uid: 2, aid: 1, utc: utc + 1 }, rej: [], ref: [], work: "video", nam: "nam", src: "src" }),
	rec_c(coll.fund, { _id: { uid: 1, aid: 1, utc }, fund: 100, msg: "fund" }),
	rec_c(coll.fund, { _id: { uid: 3, aid: 2, utc: utc + 1 }, fund: 100, msg: "fund" }),
	await md_c(coll.wsl, { nam: "标题一", uid: 1 }),
	md_c(coll.wsl, { nam: "标题二", uid: 2 }),
	md_c(coll.lit, { nam: "标题一", uid: 2 }),
])

export function p(
	obj: {
		c?: string,
		nbr?: string,
		uid?: number,
		sid?: number,
		aid?: number,
		wslid?: number,
		litid?: number,
		utc?: number,
		adm1?: string,
		adm2?: string,
		f?: "",
	}
) {
	return new URLSearchParams(Object.entries(obj).map(([k, v]) => [k, `${v}`]))
}

Deno.test("nid", async () => {
	assertEquals(await que("nid", p({})), {
		adm1nsid: [["江苏", 2], ["四川", 1]],
		adm2nsid: [["苏州", 2], ["成都", 1]],
		adm1naid: [["江苏", 2], ["四川", 1]],
		adm2naid: [["苏州", 2], ["成都", 1]],
	})
})

Deno.test("usr", async () => {
	const u = await que("usr", p({ uid: 1 })) as Usr
	assertEquals(u!.nrec, { work: 2, fund: 1 })
})

Deno.test("soc", async () => {
	const s = await que("soc", p({})) as [number, string][]
	assertEquals(s, [[1, "小组一"], [2, "小组二"], [3, "小组三"]])
	const s1 = await que("soc", p({ sid: s[0][0] })) as Soc
	assertEquals(s1?.nam, s[0][1])
	assertEquals(s1?.nrec, { work: 3, fund: 2 })
})

Deno.test("agd", async () => {
	const a = await que("agd", p({})) as [number, string][]
	assertEquals(a, [[1, "活动一"], [2, "活动二"], [3, "活动三"]])
	const a1 = await que("agd", p({ aid: a[0][0] })) as Agd
	assertEquals(a1?.nam, a[0][1])
	assertEquals(a1?.nrec, { work: 2, fund: 1 })
})

Deno.test("ord", async () => {
	const ord_nbr1 = await que("ord", p({ nbr: "11111111111", utc: 0 })) as Ord
	const ord_nbr2 = await que("ord", p({ nbr: "11111111112", utc: 0 })) as Ord
	const ord_aid = await que("ord", p({ aid: 2, utc: 0 })) as Ord
	const ord_utc = await que("ord", p({ aid: 2, utc: ord_aid!.ord[0]._id.utc })) as Ord
	assertEquals(ord_nbr1?.ord.length, 2)
	assertEquals(ord_nbr2?.ord.length, 1)
	assertEquals(ord_aid?.ord.length, 2)
	assertEquals(ord_utc?.ord, ord_aid?.ord.slice(1, 2))
})

Deno.test("rec", async () => {
	const work = await que("rec", p({ c: "work", utc: 0 })) as Rec
	const fund = await que("rec", p({ c: "fund", utc: 0 })) as Rec
	assertEquals(work!.rec.length, 3)
	assertEquals(fund!.rec.length, 2)
	const work_id = await que("rec", p({ c: "work", uid: 2, aid: 1, utc: utc + 1 })) as Rec
	const work_utc = await que("rec", p({ c: "work", utc: work!.rec[0]._id.utc })) as Rec
	const work_uid1 = await que("rec", p({ c: "work", utc: 0, uid: 1 })) as Rec
	const fund_aid2 = await que("rec", p({ c: "fund", utc: 0, aid: 2 })) as Rec
	const fund_sid2 = await que("rec", p({ c: "fund", utc: 0, sid: 2 })) as Rec
	assertEquals(work?.rec.slice(0, 1), work_id?.rec)
	assertEquals(work?.rec.slice(1), work_utc?.rec)
	assertEquals(work_utc, work_uid1)
	assertEquals(fund?.rec.slice(0, 1), fund_aid2?.rec)
	assertEquals(fund_aid2, fund_sid2)
})

Deno.test("md", async () => {
	const wsl = await que("md", p({ wslid: 0, f: "" })) as Md
	const lit = await que("md", p({ litid: 0, f: "" })) as Md
	assertEquals(wsl!.md.length, 2)
	assertEquals(lit!.md.length, 1)
	const wsl_1 = await que("md", p({ wslid: 2, f: "" })) as Md
	const wsl_2 = await que("md", p({ wslid: 2, })) as Md
	const lit_3 = await que("md", p({ litid: 3, f: "" })) as Md
	assertEquals(wsl_1!.md, wsl!.md.slice(1))
	assertEquals(wsl_2!.md, wsl!.md.slice(0, 1))
	assertEquals(lit_3!.md.length, 1)
})
