import { is_adm } from "../src/ont/adm.ts";
import { frm_base64, frm_hex, frm_u8, to_base64, to_hex, to_u8 } from "../src/ont/base.ts";
import { utc_dt } from "../src/ont/utc.ts";
import { assertEquals } from "./mod.test.ts";

Deno.test("base", () => {
    const t = "this is a test 1234"
    assertEquals(t, frm_u8(to_u8(t)))

    const len = 1023
    const b = new Uint8Array(len)
    b.forEach((_, n) => b[n] = Math.floor(Math.random() * 256))
    const b64 = to_base64(b)
    assertEquals(b, frm_base64(b64))
    assertEquals(len / 3 * 4, b64.length)

    const b16 = to_hex(b)
    assertEquals(b, frm_hex(b16))
    assertEquals(len * 2, b16.length)
})

Deno.test("utc", () => {
    const short = "2023-4-18 04:35"
    const utc = new Date(short).getTime()
    assertEquals(short, utc_dt(utc))
    assertEquals("2023年4月18日 04:35", utc_dt(utc, "medium"))
    assertEquals("2023-04-18", utc_dt(utc, "pad"))
    assertEquals("2023-04-17", utc_dt(utc, "padutc"))
})


Deno.test("adm", () => {
    assertEquals([true, false, true], [
        is_adm("江苏", "苏州"),
        is_adm("江苏", "重庆"),
        is_adm("江苏", "南京")
    ])
})