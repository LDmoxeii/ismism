import { agd_c, agd_d, agd_r, agd_u } from "../src/eid/agd.ts";
import { aut, aut_f, aut_u } from "../src/eid/aut.ts";
import { coll, db } from "../src/eid/db.ts";
import { msg_c, msg_f, msg_r, msg_u } from "../src/eid/msg.ts";
import { cdt_u, rec_c, rec_d, rec_f, rec_r, rec_s } from "../src/eid/rec.ts";
import { soc_c, soc_d, soc_r, soc_u } from "../src/eid/soc.ts";
import type { Rec } from '../src/eid/typ.ts';
import { usr_c, usr_d, usr_r, usr_u } from "../src/eid/usr.ts";
import { assertEquals } from "./mod.test.ts";

await db("tst", true)

Deno.test("usr", async () => {
	const nbr = "11111111111"
	assertEquals(null, await usr_r({ nbr }, { nbr: 1 }))

	const _id = await usr_c(nbr, "四川", "成都") as number
	assertEquals(1, _id)
	assertEquals({
		_id, nam: "1", msg: "", adm2: "成都", nbr,
	}, await usr_r({ nbr }, {
		nam: 1, msg: 1, adm2: 1, nbr: 1,
	}))
	assertEquals(1, await usr_u(_id, { $set: { nam: "中文名", adm1: "广东", adm2: "汕头", msg: "介绍" } }))
	assertEquals({
		_id: 1, nam: "中文名", adm2: "汕头", msg: "介绍",
	}, await usr_r({ nbr }, {
		nam: 1, msg: 1, adm2: 1,
	}))
	assertEquals(1, await usr_d(_id))
})

Deno.test("soc", async () => {
	const nam = "俱乐部"
	assertEquals(null, await soc_r(1))
	assertEquals(1, await soc_c(nam, "江苏", "苏州"))
	assertEquals({ _id: 1, nam, adm2: "苏州", sec: [], agr: { msg: "", utc: 0, } },
		await soc_r(1, { nam: 1, adm2: 1, sec: 1, agr: 1, }))
	assertEquals(1, await soc_u(1, { $set: { agr: { msg: "agr", utc: 1 } } }))
	assertEquals({ _id: 1, agr: { msg: "agr", utc: 1, }, },
		await soc_r(1, { agr: 1, }))
	assertEquals(1, await soc_d(1))
})

Deno.test("agd", async () => {
	const nam = "俱乐部"
	assertEquals(null, await agd_r(1))
	assertEquals(1, await agd_c(nam, "江苏", "苏州", 1))
	assertEquals({ _id: 1, nam, adm2: "苏州", msg: "", },
		await agd_r(1, { nam: 1, adm2: 1, msg: 1, }))
	assertEquals(1, await agd_u(1, { $set: { msg: "msg" } }))
	assertEquals({ _id: 1, msg: "msg", }, await agd_r(1, { msg: 1, }))
	assertEquals(1, await agd_d(1))
})

Deno.test("rec", async () => {
	const [usr, soc, utc, msg, amt, aug] = [1, 2, 1, "msg", 1,
		{ msg: "msg", amt: 1, usr: 1, utc: 5, }
	]
	const id: Rec["_id"][] = [
		{ usr, soc, utc },
		{ usr, soc, utc: utc + 1 },
		{ usr, soc, utc: utc + 2 },
	]

	assertEquals([id[0], id[1], id[2]], await Promise.all([
		rec_c(coll.cdt, {
			_id: id[0],
			msg, amt,
			utc: { eft: 1, exp: 2, agr: 0 },
		}),
		rec_c(coll.cdt, {
			_id: id[1],
			msg, amt,
			utc: { eft: 2, exp: 5, agr: 0 },
		}),
		rec_c(coll.cdt, {
			_id: id[2],
			msg, amt,
			utc: { eft: 3, exp: 5, agr: 0 },
		}),
	]))
	assertEquals(
		[await rec_r(coll.cdt, { _id: id[0] })],
		await rec_f(coll.cdt, { usr }, { to: utc + 1 })
	)
	assertEquals(2, (await rec_f(coll.cdt, { usr }, { now: 4 }))?.length)
	assertEquals(3, (await rec_f(coll.cdt, { usr, soc }, { eft: 1, exp: 5 }))?.length)
	assertEquals(2, (await rec_f(coll.cdt, { soc }, { eft: 3, exp: 4 }))?.length)
	assertEquals(0, (await rec_f(coll.cdt, { usr, soc }, { eft: 5, exp: 6 }))?.length)
	assertEquals(1, await cdt_u({ usr, soc, utc: utc + 2 }, { $set: { "utc.agr": utc + 10 } }))
	assertEquals(1, await cdt_u({ usr, soc, utc: utc + 2 }, { $push: { aug } }))
	assertEquals({ utc: { eft: 3, exp: 5, agr: utc + 10 }, aug: [aug] },
		(await rec_f(coll.cdt, { usr, soc }, { now: 4 }))!.map(c => ({ utc: c.utc, aug: c.aug }))[0])
	assertEquals(1, await cdt_u({ usr, soc, utc: utc + 2 }, { $pop: { aug: 1 } }))
	assertEquals(0, await cdt_u({ usr, soc, utc: utc + 2 }, { $pop: { aug: 1 } }))

	assertEquals([{ soc, amt: 3 }], await rec_s(coll.cdt, { usr }, {}))
	assertEquals([{ soc, amt: 2 }], await rec_s(coll.cdt, { soc }, { now: 4 }))
	assertEquals([{ soc, amt: 3 }], await rec_s(coll.cdt, { usr }, { eft: 1, exp: 6 }))
	assertEquals(1, await rec_d(coll.cdt, { usr, soc, utc }))
	assertEquals([{ soc, amt: 2 }], await rec_s(coll.cdt, { usr }, { eft: 1, exp: 6 }))
})

Deno.test("msg", async () => {
	assertEquals([], await msg_f(coll.wsl))
	assertEquals(1, await msg_c(coll.wsl, "标题", 2))
	assertEquals(2, await msg_c(coll.wsl, "标题", 2))
	assertEquals(1, await msg_u(coll.wsl, 1, { $set: { pin: true, msg: "msg1" } }))
	assertEquals(1, await msg_u(coll.wsl, 1, { $set: { msg: "msg2" } }))
	const [m1, m2] = await Promise.all([msg_r(coll.wsl, 1), msg_r(coll.wsl, 2)])
	assertEquals("msg2", m1?.msg)
	assertEquals([m1?._id, m2?._id], (await msg_f(coll.wsl)).map(m => m._id))
})

Deno.test("aut", async () => {
	assertEquals({ sup: [1, 2], aut: [2], wsl: [], lit: [] }, await aut())
	assertEquals(1, await aut_u({ aut: [2, 3], wsl: [3, 4], lit: [3, 4] }))
	assertEquals(["aut", "wsl", "lit",], await aut_f(3))
})