import { is_adm } from "../ont/adm.ts"
import { assertEquals } from "./mod.test.ts"

Deno.test("adm", () => {
    assertEquals([true, false, true], [
        is_adm("江苏", "苏州"),
        is_adm("江苏", "重庆"),
        is_adm("江苏", "南京")
    ])
})