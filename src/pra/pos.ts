import type { Ret } from "./can.ts"
export type { PsgRet } from "./pas.ts"
export type { PreRet } from "./pre.ts"
export type { PutRet } from "./put.ts"

import { Psg, pas, psg } from "./pas.ts"
import { Pre, pre } from "./pre.ts"
import { Put, put } from "./put.ts"

export type Pos = Psg | Pre | Put

export type PosRet = {
    ret: Ret<typeof psg>["ret"] | Ret<typeof pre> | Ret<typeof put>,
    jwt?: string | null,
    etag?: "",
}

export async function pos(
    b: string,
    jwt?: string,
): Promise<PosRet> {
    let json
    try { json = b.length > 0 ? JSON.parse(b) as Pos : {} }
    catch { return { ret: null } }

    const p = jwt ? await pas(jwt) : null
    let ret = null
    if ("psg" in json) return psg(p, json)
    else if (!p) return { ret: null, jwt: null }
    else if ("pre" in json) ret = await pre(p, json)
    else if ("put" in json) ret = await put(p, json)

    return ret ? { ret, etag: "" } : { ret }
}
