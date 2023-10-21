import { Usr } from "../../src/eid/typ.ts";
import type { QueRet } from "../../src/pra/que.ts"
import { que } from "./fetch.ts"
import { nav } from "./nav.ts"
import { btn_usr, id, idn, sms } from "./section.ts"
import { article } from "./template.ts"

export async function usr(
	q: { usr: Usr["_id"] } | { nam: Usr["nam"] }
) {
	const t = article()
	const u = await que<QueRet["usr"]>({ que: "usr", ...q })
	if (u) {
		t.append(id(u))
		if (nav.pas && nav.pas.usr == u._id) t.append(btn_usr(u))
	} else t.append(idn(`${usr}`, "无效用户", `#${usr} 是无效用户`))
}

export function psg(
) {
	article(idn("psg", "用户登录", "输入手机号与验证码"), sms())
}
