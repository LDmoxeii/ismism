import type { Que, QueRet } from "../../src/pra/que.ts"
import { json_s } from "../../src/ont/json.ts"

// 绑定数据（浏览器端）<->（服务器端）

// 查询接口
export async function que<
    T extends QueRet[Que["que"]]
>(
    q: Que
) {
    const s = json_s(q)
    const r = (await fetch(`/q?${s}`)).json() // HTTP GET 请求
    console.log(`GET ${s}`)
    return r as unknown as T
}

// 请求接口