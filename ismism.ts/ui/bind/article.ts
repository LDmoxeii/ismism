import type { Usr } from "../../src/eid/typ.ts"
import { QueRet } from "../../src/pra/que.ts"
import { que } from "./fetch.ts"
import { id, idn } from "./section.ts"

export async function usr(
	usr: Usr["_id"]
): Promise<HTMLElement> {
	const t = document.createElement("article")
	const u = await que<QueRet["usr"]>({ que: "usr", usr })
	t.append(u ? id(u) : idn(usr))
	return t
}
