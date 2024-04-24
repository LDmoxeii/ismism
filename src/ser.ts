import { db } from "./eid/db.ts"
import { utc_dt, utc_etag, utc_h } from "./ont/utc.ts"
import { que } from "./pra/que.ts"

db("ismism")

let utc_f = Date.now()
let etag = ""

function log(
    utc: number,
    msg: string,
    status?: number,
) {
    console.log(`${utc_dt(utc, "short")} - ${msg} - ${status ?? ""} - ${etag}`)
}


async function handler(
    req: Request,
) {
    const url = new URL(req.url)
    const [_, r] = url.pathname.split("/")
    const utc = Date.now()
    if (utc - utc_f > utc_h) etag = ""
    switch (r) {
        case "quit": {
            log(utc, "quit")
            Deno.exit(); break
        } case "update": {
            etag = ""
            log(utc, "etag updated")
            return new Response(null, { status: 200 })
        } case "q": {
            const s = decodeURI(url.search)
            if (etag == "") { etag = utc_etag(); utc_f = utc }
            if (req.headers.get("if-none-match")?.includes(etag)) {
                log(utc, `${r}${s}`, 304)
                return new Response(null, { status: 304, headers: { etag } })
            }
            log(utc, `${r}${s}`, 200)
            const q = await que(s)
            return new Response(JSON.stringify(q), { status: 200, headers: { etag } })
        }
    }
    return new Response(null, { status: 400 })
}

Deno.serve({ handler, port: 728 })