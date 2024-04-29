import type { Ret } from "./can.ts"
import { Psg, pas, psg } from "./pas.ts"
import { Pre, pre } from "./pre.ts"

export type { PsgRet } from "./pas.ts"
export type { PreRet } from "./pre.ts"

export type Pos = Psg | Pre
export type PosRet = {
    psg: Ret<typeof psg>,
    pre: { ret: Ret<typeof pre> },
}

export async function pos(
    b: string,
    jwt?: string,
) {
    let json
    try { json = b.length > 0 ? JSON.parse(b) as Pos : {} }
    catch { return { ret: null } }

    const p = jwt ? await pas(jwt) : null

    if ("psg" in json) return psg(p, json)
    else if (!p) return { ret: null }
    else if ("pre" in json) return { ret: await pre(p, json) }

    return { ret: null }
}
