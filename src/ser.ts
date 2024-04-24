import { db } from "./eid/db.ts"
import { utc_dt, utc_etag, utc_h } from "./ont/utc.ts"
import { que } from "./pra/que.ts"

db("ismism")

let utc_f = Date.now()  // 上一次 刷新缓存的时间
let etag = "" // w3c 的 etag 缓存控制

// 浏览器的 etag 一样，则说明数据一样，无需从新传输，可直接用之前的缓存
// etag 不一样，则重新传输数据

// 日志
function log(
    utc: number,
    msg: string,
    status?: number,
) {
    console.log(`${utc_dt(utc, "short")} - ${msg} - ${status ?? ""} - ${etag}`)
}

// 响应  - 路由 routing 
async function handler(
    req: Request,  // w3c 格式的 http 请求
) {
    const url = new URL(req.url) // 把 http 请求的 网址部分 url 
    const [_, r] = url.pathname.split("/")  // https://ismist.cn/q?que="soc"&soc=2 -> URL {hostname: "ismist.cn", pathname: "/q", search: "?que="soc"&soc=2"}
    const utc = Date.now()
    if (utc - utc_f > utc_h) etag = ""  // 超过1小时 自动刷新缓存
    switch (r) {
        case "quit": { // 关闭请求，关闭服务   pathname: "/quit"
            log(utc, "quit")
            Deno.exit(); break
        } case "update": { // 刷新请求 强制 手动刷新缓存  "/update"
            etag = ""
            log(utc, "etag updated")
            return new Response(null, { status: 200 })
        } case "q": { // 查询请求  读
            const s = decodeURI(url.search)  // 将 url 编码的字符串，转换成 utf-8  例子  %20soc%20 -> "soc"
            if (etag == "") { etag = utc_etag(); utc_f = utc }
            if (req.headers.get("if-none-match")?.includes(etag)) { // 缓存控制的标签 etag 对得上，则无需返回任何数据
                log(utc, `${r}${s}`, 304) // 404 -> 无此数据 , 304 -> 无新数据
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