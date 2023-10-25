import type { Soc, Usr } from "../../src/eid/typ.ts"
import type { QueRet } from "../../src/pra/que.ts"
import { que } from "./fetch.ts"
import { nav } from "./nav.ts"
import { btn_aut, btn_usr, id, idn, lp, sms } from "./section.ts"
import { article } from "./template.ts"
import { adm } from "../../src/ont/adm.ts"

export async function admf(
) {
	const a = await que<QueRet["adm"]>({ que: "adm" })
	const s = new Map(a.soc)
	article(
		idn("soc", "同城俱乐部"),
		lp("地区：", a.adm1.map(([a1, s1]) => {
			const adm2 = adm.get(a1)!
			const a2 = a.adm2.filter(([a2]) => adm2.includes(a2))
			return [`${a1}(${s1.length})`, () => article(
				idn("soc", a1),
				lp("地区：", a2.map(([a2, s2]) => [`${a2}(${s2.length})`, () => article(
					idn("soc", `${a1} ${a2}`),
					lp(`俱乐部（${s2.length}）：`, s2.map(s2 => [s.get(s2)!, `#s${s2}`]))
				)])),
				lp(`俱乐部（${s1.length}）：`, s1.map(s1 => [s.get(s1)!, `#s${s1}`])),
			)]
		})),
		lp(`俱乐部（${a.soc.length}）：`, a.soc.map(([s, n]) => [n, `#s${s}`])),
	)
}

export async function usr(
	q: { usr: Usr["_id"] } | { nam: Usr["nam"] }
) {
	const u = await que<QueRet["usr"]>({ que: "usr", ...q })
	const t = article(id("usr" in q ? `${q.usr}` : q.nam, u))
	if (u && nav.pas && nav.pas.usr == u._id) t.append(btn_usr(u), btn_aut(nav.pas))
}

export async function soc(
	_id: Soc["_id"]
) {
	const s = await que<QueRet["soc"]>({ que: "soc", soc: _id })
	article(id(`s${_id}`, s))
}

export function psg(
) {
	article(idn("psg", "用户登录", "输入手机号与验证码"), sms())
}
