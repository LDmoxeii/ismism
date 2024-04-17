import { assertEquals } from "https://deno.land/std/testing/asserts.ts"
import { is_adm } from "../ont/adm.ts"

Deno.test("adm", () => {
    assertEquals([true, false, false], [
        is_adm("江苏", "苏州"),
        is_adm("江苏", "重庆"),
        is_adm("江苏", "南京")
        ])
})