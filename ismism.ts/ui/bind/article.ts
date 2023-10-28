import type { Agd, Msg, Soc, Usr } from "../../src/eid/typ.ts"
import type { QueRet } from "../../src/pra/que.ts"
import { btn_agd, btn_aut, btn_msg, btn_pos, btn_soc, btn_usr, dtl, id, idn, lp, sms } from "./section.ts"
import { que } from "./fetch.ts"
import { nav } from "./nav.ts"
import { article } from "./template.ts"
import { adm } from "../../src/ont/adm.ts"
import { is_in } from "../../src/pra/can.ts"
import { is_aut } from "../../src/eid/is.ts"
import { utc_dt } from "../../src/ont/utc.ts"

export async function agr(
	soc: Soc["_id"],
) {
	const s = await que<QueRet["soc"]>({ que: "soc", soc })
	if (!s || !nav.pas) return
	article(
		idn("用户协议", s.nam, `更新时间：${utc_dt(s.agr.utc)}\n\n必须同意用户协议才能继续使用网站`, s.agr.msg),
		btn_pos(nav.pas, `#${nav.pas.usr}`, () => ({
			put: "cdt", usr: nav.pas!.usr, soc, agr: Date.now()
		}), undefined)
	)
}

export async function admf(
) {
	const a = await que<QueRet["adm"]>({ que: "adm" })
	const s = new Map(a.soc)
	a.soc.sort((a, b) => a[0] - b[0])
	article(
		idn("soc", "同城俱乐部"),
		lp("地区：", a.adm1.map(([a1, s1]) => {
			const adm2 = adm.get(a1)!
			const a2 = a.adm2.filter(([a2]) => adm2.includes(a2))
			return [`${a1}(${s1.length})`, () => article(
				idn("soc", a1),
				lp("地区：", a2.map(([a2, s2]) => [`${a2}(${s2.length})`, () => article(
					idn("soc", `${a1} ${a2}`),
					lp(`俱乐部（${s2.length}）：`, s2.sort((a, b) => a - b).map(s2 => [s.get(s2)!, `#s${s2}`]))
				)])),
				lp(`俱乐部（${s1.length}）：`, s1.sort((a, b) => a - b).map(s1 => [s.get(s1)!, `#s${s1}`])),
			)]
		})),
		lp(`俱乐部（${a.soc.length}）：`, a.soc.map(([s, n]) => [n, `#s${s}`])),
	)
}

export async function usr(
	q: { usr: Usr["_id"] } | { nam: Usr["nam"] },
) {
	const u = await que<QueRet["usr"]>({ que: "usr", ...q })
	const soc = new Map(u?.soc ?? [])
	const rol = u ? [
		...u.cdt.map(c => [`${soc.get(c.soc)}会员(${c.amt}积分)`, `#s${c.soc}`, "cdt"]),
		...u.sec.map(s => [`${soc.get(s)!}联络员`, `#s${s}`, "sec"]),
		...u.sum.ern.map(c => [`${soc.get(c.soc)}(${c.amt}贡献)`, `#s${c.soc}`, "ern"]),
	] as [string, string, string][] : []
	const t = article()
	if (rol.length > 0) t.append(lp("", rol, false))
	t.append(id(u ? `${u._id}` : "nam" in q ? q.nam : `${q.usr}`, u))
	if (u) t.append(
		dtl(`积分记录：（${u.sum.cdt.length}个俱乐部）`, { que: "cdt", usr: u._id, utc: 0 }, nav.pas),
		dtl(`积分使用：（${u.sum.dbt.length}个俱乐部）`, { que: "dbt", usr: u._id, utc: 0 }, nav.pas),
		dtl(`贡献记录：（${u.sum.ern.length}个俱乐部）`, { que: "ern", usr: u._id, utc: 0 }, nav.pas),
	)
	if (u && nav.pas && nav.pas.usr == u._id) t.append(btn_usr(nav.pas, u), btn_aut(nav.pas))
}

export async function soc(
	_id: Soc["_id"],
) {
	const s = await que<QueRet["soc"]>({ que: "soc", soc: _id })
	const t = article(id(`s${_id}`, s))
	if (!s) return
	const agd = s.agd.map(([a, n]) => [n, `#a${a}`]) as [string, string][]
	t.append(lp("联络员：", s.sec.map(([u, n]) => [n, `#${u}`, "ln"])))
	if (agd.length > 0) t.append(lp("活动：", agd))
	if (nav.pas) {
		if (is_in(nav.pas.cdt, _id) || is_aut(nav.pas.aut, nav.pas.usr)) t.append(
			lp(`会员：(${s.cdt.length}) (仅会员可见)`, s.cdt.map(([u, n]) => [n, `#${u}`, "ln"])),
			dtl(`积分记录：（总积分：${s.sum.cdt}）`, { que: "cdt", soc: s._id, utc: 0 }, nav.pas),
			dtl(`积分使用：（总使用：${s.sum.dbt}）`, { que: "dbt", soc: s._id, utc: 0 }, nav.pas),
			dtl(`贡献记录：（总贡献：${s.sum.ern}）`, { que: "ern", soc: s._id, utc: 0 }, nav.pas),
		)
		t.append(btn_soc(nav.pas, s))
	}
}

export async function agd(
	_id: Agd["_id"],
) {
	const a = await que<QueRet["agd"]>({ que: "agd", agd: _id })
	const t = article(id(`a${_id}`, a))
	if (!a) return
	t.prepend(lp("", [[a.soc[1], `#s${a.soc[0]}`, "cdt"]], false))
	if (nav.pas && is_in(nav.pas.agd, _id)) t.append(btn_agd(nav.pas, a))
}

export async function msg(
	q: "wsl" | "lit",
	_id: Msg["_id"] | 0,
) {
	const m = await que<QueRet["wsl" | "lit"]>({ que: q, msg: _id, ..._id == 0 ? { f: true } : {} })
	const usr = new Map(m.usr)
	const t = article(id(_id == 0 ? q : `${q}${_id}`, m))
	if ("length" in m.msg) {
		if (m.msg.length > 0) t.append(lp("", m.msg.map(m => [
			`${m.pin ? "【置顶】" : ""}${m.nam}  -  ${usr.get(m.usr)}`,
			`#${q}${m._id}`]), true))
		if (nav.pas && is_aut(nav.pas.aut[q], nav.pas.usr)) t.append(btn_msg(nav.pas, q))
	}
	if ("_id" in m.msg && nav.pas?.usr == m.msg.usr) t.append(btn_msg(nav.pas, q, m.msg))
}

export function psg(
) {
	article(idn("psg", "用户登录", "输入手机号与验证码"), sms())
}
