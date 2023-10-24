import { agd_c } from "../src/eid/agd.ts"
import { coll, db } from "../src/eid/db.ts"
import { msg_c, msg_u } from "../src/eid/msg.ts"
import { rec_c } from "../src/eid/rec.ts"
import { soc_c, soc_u } from "../src/eid/soc.ts"
import { Cdt } from "../src/eid/typ.ts"
import { usr_c, usr_u } from "../src/eid/usr.ts"
import { jwk_set } from "../src/ont/jwt.ts"
import { QueRet, que } from "../src/pra/que.ts"
import { assertEquals } from "./mod.test.ts"

await db("tst", true)
await jwk_set("testkey")

Deno.test("que", async () => {
	const nbr = ["11111111111", "11111111112", "11111111113"]
	const now = Date.now()
	const cdt: Cdt[] = [{
		_id: { usr: 2, soc: 1, utc: now - 20000 }, msg: "msg", amt: 10,
		utc: { eft: now - 20000, exp: now - 10000, agr: 0 }, sec: 2
	}, {
		_id: { usr: 2, soc: 1, utc: now - 10000 }, msg: "msg", amt: 10,
		utc: { eft: now - 10000, exp: now + 10000, agr: 0 }, sec: 2
	}, {
		_id: { usr: 2, soc: 1, utc: now + 10000 }, msg: "msg", amt: 10,
		utc: { eft: now + 10000, exp: now + 20000, agr: 0 }, sec: 2
	}]
	const usr: QueRet["usr"] = {
		_id: 2, utc: now, nam: "用户", adm1: "四川", adm2: "成都", msg: "", sec: [1], soc: [[1, "俱乐部"]],
		cdt: [{ soc: 1, amt: 0, utc: { eft: now - 10000, exp: now + 10000, agr: 0 } }],
		sum: { cdt: [{ soc: 1, amt: 30 }], dbt: [{ soc: 1, amt: 15 }], ern: [{ soc: 1, amt: 30 }] },
	}
	const soc: QueRet["soc"] = {
		_id: 1, utc: now, nam: "俱乐部", adm1: "江苏", adm2: "苏州", msg: "",
		sec: [[1, "1"], [2, "用户"]], agr: { msg: "", utc: 0 }, cdt: [[2, "用户"]], agd: [[1, "活动"]],
		sum: { cdt: 30, dbt: 15, ern: 30 },
	}
	const agd: QueRet["agd"] = {
		_id: 1, utc: now, nam: "活动", adm1: "江苏", adm2: "苏州", msg: "", soc: [1, "俱乐部"],
	}
	await Promise.all([
		await usr_c(nbr[0], "四川", "成都"), await usr_c(nbr[1], "四川", "成都"),
		usr_c(nbr[0], "四川", "成都"), soc_c("俱乐部", "江苏", "苏州"), agd_c("活动", "江苏", "苏州", 1),
		...cdt.flatMap(c => [rec_c(coll.cdt, c), rec_c(coll.dbt, { ...c, amt: 5 }), rec_c(coll.ern, c)]),
		await msg_c(coll.wsl, "文章", 1), await msg_c(coll.wsl, "文章", 2), await msg_c(coll.wsl, "文章", 3),
	])
	await Promise.all([
		usr_u(2, { $set: { nam: "用户" } }),
		soc_u(1, { $set: { sec: [1, 2] } }),
		msg_u(coll.wsl, 2, { $set: { pin: true } })
	])
	assertEquals({ adm: [["江苏", [1]]], soc: [[1, "俱乐部"]] }, await que(`que="adm1"`) as QueRet["adm1"])
	assertEquals({ adm: [["苏州", [1]]], soc: [[1, "俱乐部"]] }, await que(`que="adm2"`) as QueRet["adm1"])
	assertEquals([null, null, null, null], await Promise.all(["", "abc=", `que="usr"&usr=0`, `que="usr"&nam="2"`].map(que)))
	assertEquals(usr, { ...await que(`que="usr"&usr=2`), utc: now })
	assertEquals(usr, { ...await que(`que="usr"&nam="用户"`), utc: now })
	assertEquals(soc, { ...await que(`que="soc"&soc=1`), utc: now })
	assertEquals(agd, { ...await que(`que="agd"&agd=1`), utc: now })
	assertEquals([2, 3, 1], (await que(`que="wsl"&msg=0&f=true`) as QueRet["wsl"]).msg.map(m => m._id))
	assertEquals([1], (await que(`que="wsl"&msg=2&f=true`) as QueRet["wsl"]).msg.map(m => m._id))
	assertEquals([2], (await que(`que="wsl"&msg=2`) as QueRet["wsl"]).msg.map(m => m._id))
})
