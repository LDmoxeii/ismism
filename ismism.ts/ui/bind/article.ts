import type { Usr } from "../../src/eid/typ.ts"
import type { QueRet } from "../../src/pra/que.ts"
import { que } from "./fetch.ts"
import { nav } from "./nav.ts"
import { btn_aut, btn_usr, id, idn, sms } from "./section.ts"
import { article } from "./template.ts"

export async function usr(
	q: { usr: Usr["_id"] } | { nam: Usr["nam"] }
) {
	const t = article()
	const u = await que<QueRet["usr"]>({ que: "usr", ...q })
	t.append(id("usr" in q ? `${q.usr}` : q.nam, u))
	if (u && nav.pas && nav.pas.usr == u._id) t.append(btn_usr(u), btn_aut(nav.pas))
}

export function psg(
) {
	article(idn("psg", "用户登录", "输入手机号与验证码"), sms())
}
