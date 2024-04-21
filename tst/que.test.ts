import { agd_c } from "../src/eid/agd.ts";
import { coll, db } from "../src/eid/db.ts";
import { rec_c } from "../src/eid/rec.ts";
import { soc_c, soc_u } from "../src/eid/soc.ts";
import { Cdt } from "../src/eid/typ.ts";
import { usr_c, usr_u } from "../src/eid/usr.ts";
import { QueRet, que } from "../src/pra/que.ts";
import { assertEquals } from "./mod.test.ts";

await db("tst", true)

Deno.test("que", async () => {
    const nbr = ["11111111111", "11111111112"]
    const now = Date.now()
    const cdt: Cdt[] = [{
        _id: { usr: 2, soc: 1, utc: now - 20000 }, msg: "msg", amt: 10,
        utc: { eft: now - 20000, exp: now - 10000, agr: 0 }, sec: 2,
    }, {
        _id: { usr: 2, soc: 1, utc: now - 10000 }, msg: "msg", amt: 10,
        utc: { eft: now - 10000, exp: now + 10000, agr: 0 }, sec: 2,
    }, {
        _id: { usr: 2, soc: 1, utc: now }, msg: "msg", amt: 10,
        utc: { eft: now + 10000, exp: now + 20000, agr: 0 }, sec: 2,
    }]
    const usr: QueRet["usr"] = {
        _id: 2, utc: now, nam: "用户", adm1: "四川", adm2: "成都", msg: "", sec: [[1, "俱乐部"]],
        cdt: [{ nam: "俱乐部", soc: 1, amt: 0 }],
        ern: [{ nam: "俱乐部", soc: 1, amt: 30 }],
        sum: { cdt: 3, dbt: 3, ern: 3 },
    }
    const soc: QueRet["soc"] = {
        _id: 1, utc: now, nam: "俱乐部", adm1: "江苏", adm2: "苏州", msg: "",
        sec: [[1, "1"], [2, "用户"]], agr: { msg: "", utc: 0 },
        cdt: [[2, "用户"]], agd: [[1, "活动"]],
        sum: { cdt: 10, dbt: 15, ern: 30 },
    }
    assertEquals([
        1, 2, 1, 1, 1, 1, ...cdt.flatMap(c => [c._id, c._id, c._id]),
    ], await Promise.all([
        await usr_c(nbr[0], "四川", "成都"), await usr_c(nbr[1], "四川", "成都"),
        agd_c("活动", "江苏", "苏州", 1), usr_u(2, { $set: { nam: "用户" } }),
        await soc_c("俱乐部", "江苏", "苏州"), soc_u(1, { $set: { sec: [1, 2] } }),
        ...cdt.flatMap(c => [rec_c(coll.cdt, c), rec_c(coll.dbt, { ...c, amt: 5 }), rec_c(coll.ern, c)]),
    ]))

    assertEquals(
        { adm1: [["江苏", [1]]], adm2: [["苏州", [1]]], soc: [[1, "俱乐部"]] },
        await que(`?que="adm"`) as QueRet["adm"],
    )
    assertEquals(usr, { ...await que(`?que="usr"&usr=2`) as QueRet["usr"], utc: now })
    assertEquals(usr, { ...await que(`?que="usr"&nam="用户"`) as QueRet["usr"], utc: now })
    assertEquals(soc, { ...await que(`?que="soc"&soc=1`) as QueRet["soc"], utc: now })
})
