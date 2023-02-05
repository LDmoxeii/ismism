import { assert, assertEquals } from "https://deno.land/std@0.173.0/testing/asserts.ts"
import { coll, db } from "../src/db.ts"
import { agd_c } from "../src/eid/agd.ts"
import { rec_c } from "../src/eid/rec.ts"
import { soc_c, soc_u } from "../src/eid/soc.ts"
import { usr_c } from "../src/eid/usr.ts"
import { Agd, que, Soc, Usr } from "../src/pra/que.ts"

await db("tst", true)

const utc = Date.now()

await Promise.all([
	await usr_c("11111111111", [1, 2], "四川", "成都"),
	await usr_c("11111111112", [1, 2], "广东", "汕头"),
	await usr_c("11111111113", [1, 2], "江苏", "苏州"),
	await soc_c("社团一", [1, 2], "四川", "成都", "社团一"),
	await soc_c("社团二", [1, 2], "江苏", "苏州", "社团二"),
	await agd_c("活动一", [1, 2], "四川", "成都", "活动一"),
	await agd_c("活动二", [1, 2], "江苏", "苏州", "活动二"),
	soc_u(1, { $set: { uid: [1, 2, 3] } }),
	soc_u(2, { $set: { uid: [3] } }),
	rec_c(coll.worker, { _id: { uid: 1, aid: 1, utc }, exp: utc, rej: [], ref: [1, 2], rol: "sec" }),
	rec_c(coll.worker, { _id: { uid: 2, aid: 2, utc }, exp: utc, rej: [], ref: [1, 2], rol: "worker" }),
	rec_c(coll.work, { _id: { uid: 3, aid: 1, utc }, rej: [], ref: [1, 2], work: "work", msg: "work" }),
	rec_c(coll.work, { _id: { uid: 1, aid: 2, utc }, rej: [], ref: [1, 2], work: "txt", nam: "txt", txt: "txt" }),
	rec_c(coll.fund, { _id: { uid: 3, aid: 1, utc }, rej: [], ref: [1, 2], fund: 100, msg: "fund" }),
])

export function p(
	obj: {
		uid?: NonNullable<Usr>["_id"],
		sid?: NonNullable<Soc>["_id"],
		aid?: NonNullable<Agd>["_id"],
		adm1?: string,
		adm2?: string,
	}
) {
	return new URLSearchParams(Object.entries(obj).map(([k, v]) => [k, `${v}`]))
}

Deno.test("usr", async () => {
	assertEquals({ ...await que("usr", p({ uid: 1 })), utc }, {
		_id: 1,
		ref: [1, 2],
		adm1: "四川",
		adm2: "成都",
		rej: [],
		nam: "1",
		utc,
		intro: "",
		unam: [[1, "1"], [2, "2"]],
		snam: [[1, "社团一"]],
		nrec: { worker: 1, work: 1, fund: 0 }
	})
})

Deno.test("soc", async () => {
	assertEquals({ ...await que("soc", p({ sid: 1 })), utc }, {
		_id: 1,
		nam: "社团一",
		ref: [1, 2],
		adm1: "四川",
		adm2: "成都",
		intro: "社团一",
		rej: [],
		utc,
		sec: [],
		uid_max: 128,
		uid: [1, 2, 3],
		res_max: 0,
		res: [],
		unam: [[1, "1"], [2, "2"], [3, "3"]],
		nrec: { worker: 2, work: 2, fund: 1 }
	})
	const [s1, s2, s] = await Promise.all([
		que("soc", p({ adm1: "四川" })),
		que("soc", p({ adm2: "苏州" })),
		que("soc", p({})),
	]) as [Soc[], Soc[], Soc[]]
	assert(s.length === 2)
	assertEquals([...s2, ...s1], s)
})

Deno.test("usr", async () => {
	assertEquals({ ...await que("agd", p({ aid: 1 })), utc }, {
		_id: 1,
		nam: "活动一",
		ref: [1, 2],
		adm1: "四川",
		adm2: "成都",
		intro: "活动一",
		rej: [],
		utc,
		detail: "",
		budget: 0,
		fund: 0,
		expense: 0,
		goal: [],
		img: [],
		res_max: 0,
		unam: [[1, "1"], [2, "2"]],
		nrec: { worker: 1, work: 1, fund: 1 }
	})
	const [a1, a2, a] = await Promise.all([
		que("agd", p({ adm2: "成都" })),
		que("agd", p({ adm1: "江苏" })),
		que("agd", p({})),
	]) as [Agd[], Agd[], Agd[]]
	assert(a.length === 2)
	assertEquals([...a2, ...a1], a)
})
