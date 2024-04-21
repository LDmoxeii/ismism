import { json } from "../ont/json.ts"
import { Ret } from "./can.ts"
import { adm } from "./doc.ts"

export type Que = {
    que: "adm"
}

export type QueRet = {
    adm: Ret<typeof adm>
}

export function que(
    s: string
) {
    const q = json<Que>(s.substring(1))
    if (q) switch (q.que) {
        case "adm": return adm()
    } 
    return null
}