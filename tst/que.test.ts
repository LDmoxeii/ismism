import { db } from "../src/eid/db.ts"
import { soc_c } from "../src/eid/soc.ts"
import { QueRet, que } from "../src/pra/que.ts"
import { assertEquals } from "./mod.test.ts"

await db("tst", true)

Deno.test("que", async () => {
    await Promise.all([
        soc_c("俱乐部", "江苏", "苏州")
    ])
    assertEquals(
        { adm1: [["江苏", [1]]], adm2: [["苏州", [1]]], soc: [[1, "俱乐部"]] },
        await que(`?que="adm"`) as QueRet["adm"]
    )
})
