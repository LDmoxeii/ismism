import type { Usr } from "../../src/eid/typ.ts"
import { QueRet } from "../../src/pra/que.ts"
import { que } from "./fetch.ts"
import { id, idn, sms } from "./section.ts"

export async function usr(
	usr: Usr["_id"]
): Promise<HTMLElement> {
	const t = document.createElement("article")
	const u = await que<QueRet["usr"]>({ que: "usr", usr })
	t.append(u ? id(u) : idn(`${usr}`, "无效用户", `#${usr} 是无效用户`))
	return t
}

export function psg(
): HTMLElement {
	const t = document.createElement("article")
	t.append(idn("psg", "用户登录", "输入手机号与验证码"), sms())
	return t
}
