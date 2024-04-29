import { db } from "../src/eid/db.ts"
import { is_utc } from "../src/eid/is.ts"
import { usr_c, usr_r } from "../src/eid/usr.ts"
import { PsgRet } from "../src/pra/pas.ts"
import { Pos, PosRet, pos } from "../src/pra/pos.ts"
import { assertEquals } from "./mod.test.ts"

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
    const { ret: pas, jwt } = await pos(json({ psg: "code", nbr, code: code?.sms?.code! })) as PosRet & { ret: PsgRet["code"] }
    assertEquals(true, pas && pas.usr == usr && jwt!.length > 0)
    assertEquals({ ret: pas }, await pos(json({ psg: "pas" }), jwt!))
    assertEquals({ ret: 1, jwt: null }, await pos(json({ psg: "clr", usr: pas!.usr }), jwt!))
})
