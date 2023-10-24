import type { Pos, Put, PsgRet, Pas } from "../../src/pra/pos.ts"
import type { QueRet } from "../../src/pra/que.ts"
import { is_aut, is_id, is_nbr, lim_aut, lim_msg_id } from "../../src/eid/is.ts"
import { utc_dt } from "../../src/ont/utc.ts"
import { pos } from "./fetch.ts"
import { Bind, article, section } from "./template.ts"
import { hash, nav, navpas, utc_rf } from "./nav.ts"
import { adm, adm1_def, adm2_def } from "../../src/ont/adm.ts"
import { is_in, is_pos, is_put } from "../../src/pra/can.ts"

export function idn(
	id: string,
	nam: string,
	mta?: string,
): Bind {
	const b = section("id")
	b.id.innerText = id
	b.nam.innerText = nam
	b.idnam.href = ""
	if (mta) b.mta.innerText = mta
	return b.bind
}

export function id(
	id: string,
	d: QueRet["usr" | "soc" | "agd"],
): Bind {
	if (!d) return idn(id, "无效链接", `#${id} 是无效 id`)
	const b = section("id")
	b.id.innerText = id
	b.nam.innerText = d.nam
	b.idnam.href = `#${id}`
	b.mta.innerText = `城市：${d.adm1} ${d.adm2}\n注册：${utc_dt(d.utc, "short")}`
	b.msg.innerText = d.msg
	return b.bind
}

export function sms(
): Bind {
	const [s, c] = [section("sms"), section("code")]
	const sms = async () => {
		if (!is_nbr(s.nbr.value)) return alert("无效手机号")
		s.nbr.readOnly = s.sms.disabled = true
		const sent = await pos<PsgRet["sms"]>({ psg: "sms", nbr: s.nbr.value, sms: true })
		if (sent) {
			const utc = sent.utc ? `\n上次发送：${utc_dt(sent.utc, "medium")}` : ""
			s.hint.innerText = `验证码已发送，可多次使用\n一小时内不再重复发送${utc}`
			s.sms.parentElement?.after(c.bind)
		} else {
			s.nbr.readOnly = s.sms.disabled = false
			alert("手机号未注册，无效手机号")
		}
	}
	const send = async () => {
		if (!c.code.checkValidity()) return alert("无效验证码")
		c.code.readOnly = c.send.disabled = true
		const p = await pos<PsgRet["code"]>({ psg: "code", nbr: s.nbr.value, code: parseInt(c.code.value) })
		if (p) {
			await navpas(p)
			hash(`#${p.usr}`)
		} else {
			c.code.readOnly = c.send.disabled = false
			alert("无效验证码")
		}
	}
	s.sms.addEventListener("click", sms)
	c.send.addEventListener("click", send)
	return s.bind
}

export function btn_usr(
	d: NonNullable<QueRet["usr"]>,
): Bind {
	const b = section("btn_usr")
	b.put.addEventListener("click", () => {
		const [nam, adm, msg] = [
			put_s("名称：（2-16个中文字符）", d.nam),
			put_adm({ adm1: d.adm1, adm2: d.adm2 }),
			put_t("简介：", d.msg, lim_msg_id),
		]
		const btn = btn_pos(`#${d._id}`, () => ({
			put: "usr", usr: d._id, nam: nam.val(), ...adm.val(), msg: msg.val(),
		}))
		article(nam.bind, adm.bind, msg.bind, btn)
	})
	b.clr.addEventListener("click", async () => {
		const usr = nav.pas?.usr
		if (usr) await pos({ psg: "clr", usr })
		navpas(null)
		hash(usr ? `#${usr}` : "")
	})
	return b.bind
}

export function btn_aut(
	p: Pas,
): Bind {
	const b = section("btn_aut")
	if (is_aut(p.aut.sup, p.usr)) b.aut.addEventListener("click", () => {
		const [aut, wsl, lit] = [
			put_s(`管理员：（最多${lim_aut.aut}名）`, p.aut.aut.join(",")),
			put_s(`法律援助编辑：（最多${lim_aut.wsl}名）`, p.aut.wsl.join(",")),
			put_s(`理论学习编辑：（最多${lim_aut.lit}名）`, p.aut.lit.join(",")),
		]
		const btn = btn_pos(`#${p.usr}`, () => ({
			put: "aut",
			aut: aut.val().split(",").map(v => parseInt(v)).filter(is_id),
			wsl: wsl.val().split(",").map(v => parseInt(v)).filter(is_id),
			lit: lit.val().split(",").map(v => parseInt(v)).filter(is_id),
		}))
		article(aut.bind, wsl.bind, lit.bind, btn)
	}); else b.aut.remove()
	if (is_aut(p.aut, p.usr) || is_in(p.sec)) b.usr.addEventListener("click", () => {
		const [adm, nbr] = [put_adm(), put_s("激活手机号：")]
		const btn = btn_pos(`#${p.usr}`, () => ({ pre: "usr", nbr: nbr.val(), ...adm.val() }))
		article(adm.bind, nbr.bind, btn)
	}); else b.usr.remove()
	if (is_aut(p.aut.aut, p.usr)) b.soc.remove()
	if (p.sec.length == 0) b.agd.remove()
	return b.bind
}

export function btn_pos(
	h: string,
	p: () => Pos | null,
	del?: Put,
): Bind {
	const b = section("btn_pos")
	if (del) b.del.addEventListener("click", async () => {
		if (!is_put(nav.pas!, del) || !confirm("确认删除？")) return
		b.del.disabled = b.put.disabled = b.ret.disabled = true
		if (await pos(del)) return hash(h)
		alert("删除失败")
		b.del.disabled = b.put.disabled = b.ret.disabled = false
	}); else b.del.remove()
	b.put.addEventListener("click", async () => {
		b.del.disabled = b.put.disabled = b.ret.disabled = true
		const d = p()
		if (d && is_pos(nav.pas!, d) && await pos(d) != null) return setTimeout(() => hash(h), utc_rf)
		alert("无效输入")
		b.del.disabled = b.put.disabled = b.ret.disabled = false
	})
	b.ret.addEventListener("click", () => hash(h))
	return b.bind
}

function put_s(
	l: string,
	s = "",
): { bind: Bind, val: () => string } {
	const b = section("put_s")
	label(b.str, l)
	if (s) b.str.value = s
	return { bind: b.bind, val: () => b.str.value }
}

function put_adm(
	d = { adm1: adm1_def, adm2: adm2_def },
): { bind: Bind, val: () => ({ adm1: string, adm2: string }) } {
	const b = section("put_adm")
	selopt(b.adm1, adm.keys())
	b.adm1.value = d.adm1
	selopt(b.adm2, adm.get(d.adm1)!)
	b.adm2.value = d.adm2
	b.adm1.addEventListener("change", () => selopt(b.adm2, adm.get(b.adm1.value)!))
	return { bind: b.bind, val: () => ({ adm1: b.adm1.value, adm2: b.adm2.value }) }
}

function put_t(
	l: string,
	t: string,
	lim: number,
): { bind: Bind, val: () => string } {
	const b = section("put_t")
	b.txt.maxLength = lim
	b.txt.value = t
	label(b.txt, `${l}：（${b.txt.value.length}/${b.txt.maxLength} 个字符）`)
	b.txt.addEventListener("input", () => {
		label(b.txt, `${l}：（${b.txt.value.length}/${b.txt.maxLength} 个字符）`)
		b.txt.style.height = "auto"
		b.txt.style.height = `${b.txt.scrollHeight}px`
	})
	if (t) setTimeout(() => b.txt.dispatchEvent(new Event("input")), 50)
	return { bind: b.bind, val: () => b.txt.value }
}

function label(
	el: HTMLElement | SVGSVGElement,
	s: string,
) {
	const l = el.previousElementSibling as HTMLLabelElement
	l.innerText = s
}

function selopt(
	sel: HTMLSelectElement,
	opt: Iterable<string>,
) {
	sel.options.length = 0
	for (const op of opt) {
		const t = document.createElement("option")
		t.text = op
		sel.add(t)
	}
}
