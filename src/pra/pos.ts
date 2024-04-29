import { Ret } from "./can.ts"
import { Psg, pas, psg } from "./pas.ts"

export type Pos = Psg
export type PosRet = Ret<typeof psg>

export async function pos(
    b: string,
    jwt?: string,
) {
    let json
    try { json = b.length > 0 ? JSON.parse(b) as Pos : {} }
    catch { return { ret: null } }

    const p = jwt ? await pas(jwt) : null

    if ("psg" in json) return psg(p, json)

    return { ret: null }
}
