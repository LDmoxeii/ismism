import { db } from "../src/eid/db.ts";
import { is_utc } from "../src/eid/is.ts";
import type { Cdt, Dbt, Ern } from "../src/eid/typ.ts";
import { usr_c, usr_r } from "../src/eid/usr.ts";
import { PsgRet } from "../src/pra/pas.ts";
import { Pos, PosRet, pos } from "../src/pra/pos.ts";
import { assertEquals } from "./mod.test.ts";

await db("tst", true)

function json(
    p: Pos
): string {
    return JSON.stringify(p)
}

Deno.test("pas", async () => {
    const nbr = "11111111111"
    const usr = await usr_c(nbr, "四川", "成都")
    assertEquals(1, usr)
    assertEquals([
        { ret: null }, { ret: null }, { ret: null }
    ], await Promise.all([
        pos(""), pos("", ""), pos(json({ psg: "pas" }), "invalidkey")
    ]))
    assertEquals({ ret: { sms: false } }, await pos(json({ psg: "sms", nbr, sms: false })))
    const { ret: sms } = await pos(json({ psg: "sms", nbr, sms: false })) as { ret: PsgRet["sms"] }
    assertEquals(true, sms && !sms.sms && is_utc(sms.utc!))
    const code = await usr_r({ nbr }, { sms: 1 })
    const { ret: pas, jwt } = await pos(json({ psg: "code", nbr, code: code?.sms?.code! })) as PosRet["psg"] & { ret: PsgRet["code"] }
    assertEquals(true, pas && pas.usr == usr && jwt!.length > 0)
    assertEquals({ ret: pas }, await pos(json({ psg: "pas" }), jwt!))
    assertEquals({ ret: 1, jwt: null }, await pos(json({ psg: "clr", usr: pas!.usr }), jwt!))
})

Deno.test("pos", async () => {
    const nbr = ["11111111111", "11111111112", "11111111113"]
    const [adm1, adm2] = ["广东", "汕头"]
    const utc = Date.now()
    const cdt: Cdt = {
        _id: { usr: 2, soc: 1, utc }, msg: "cdt", amt: 10,
        utc: { eft: utc - 10000, exp: utc + 10000, agr: 0 }, sec: 2
    }
    const cdt2: Cdt = {
        _id: { usr: 1, soc: 1, utc }, msg: "cdt", amt: 10,
        utc: { eft: utc - 10000, exp: utc + 10000, agr: 0 }, sec: 2
    }
    const dbt: Dbt = { _id: { usr: 2, soc: 1, utc }, msg: "dbt", amt: 5 }
    const dbt2: Dbt = { _id: { usr: 2, soc: 1, utc: utc + 1 }, msg: "dbt", amt: 10 }
    const ern: Ern = { _id: { usr: 2, soc: 1, utc }, msg: "ern", amt: 5, sec: 2 }

    await usr_c(nbr[0], adm1, adm2)
    const u2 = (await usr_c(nbr[1], adm1, adm2))!
    await pos(json({ psg: "sms", nbr: nbr[1], sms: false }))
    const { sms } = (await usr_r({ _id: u2 }, { sms: 1 }))!
    const { jwt } = (await pos(json({ psg: "code", nbr: nbr[1], code: sms!.code })))! as PosRet["psg"]
    assertEquals([
        3, 1,
        null, null, null, null, null, null,
    ], (await Promise.all([
        pos(json({ pre: "usr", nbr: nbr[2], adm1, adm2 }), jwt!),
        await pos(json({ pre: "soc", nam: "俱乐部", adm1, adm2 }), jwt!),

        pos(json({ pre: "agd", nam: "活动", soc: 1 }), jwt!),
        pos(json({ pre: "cdt", cdt }), jwt!),
        pos(json({ pre: "dbt", dbt }), jwt!),
        pos(json({ pre: "ern", ern }), jwt!),
        pos(json({ pre: "wsl", nam: "文章" }), jwt!),
        pos(json({ pre: "lit", nam: "文章" }), jwt!),
    ])).map(r => r.ret))
})

