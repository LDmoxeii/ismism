import type { Pos, Put, PsgRet, Pas } from "../../src/pra/pos.ts"
import type { QueRet } from "../../src/pra/que.ts"
import { is_aut, is_id, is_nbr, lim_aut, lim_msg, lim_msg_id, lim_sec } from "../../src/eid/is.ts"
import { utc_d, utc_dt } from "../../src/ont/utc.ts"
import { pos } from "./fetch.ts"
import { Bind, article, section } from "./template.ts"
import { hash, navpas, utc_rf } from "./nav.ts"
import { adm, adm1_def, adm2_def } from "../../src/ont/adm.ts"
import { is_in, is_pos, is_put } from "../../src/pra/can.ts"

const { marked } = await import("https://cdn.jsdelivr.net/npm/marked@latest/lib/marked.esm.js")

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
	else b.mta.remove()
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
	b.msg.innerHTML = marked.parse(d.msg)
	return b.bind
}

export function lp(
	l: string,
	hf: [string, string, string?][] | [string, () => void][],
	ind = true,
): Bind {
	const b = section("lp")
	label(b.lp, l)
	b.lp.append(...hf.map(([s, h, c]) => {
		if (typeof h == "string") {
			const a = document.createElement("a")
			a.innerText = s
			a.href = h
			if (c) a.classList.add(c)
			return a
		} else {
			const btn = document.createElement("button")
			btn.innerText = s
			btn.addEventListener("click", h)
			return btn
		}
	}))
	if (ind) b.lp.classList.add("ind")
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
	pas: Pas,
	d: NonNullable<QueRet["usr"]>,
): Bind {
	const b = section("btn_usr")
	b.put.addEventListener("click", () => {
		const [nam, adm, msg] = [
			put_s("名称：（2-16个中文字符）", d.nam),
			put_adm({ adm1: d.adm1, adm2: d.adm2 }),
			put_t("简介：", d.msg, lim_msg_id),
		]
		const btn = btn_pos(pas, `#${d._id}`, () => ({
			put: "usr", usr: d._id, nam: nam.val(), ...adm.val(), msg: msg.val(),
		}))
		article(nam.bind, adm.bind, msg.bind, btn)
	})
	b.clr.addEventListener("click", async () => {
		const usr = pas.usr
		if (usr) await pos({ psg: "clr", usr })
		navpas(null)
		hash(usr ? `#${usr}` : "")
	})
	return b.bind
}

export function btn_aut(
	pas: Pas,
): Bind {
	const b = section("btn_aut")
	if (is_aut(pas.aut.sup, pas.usr)) b.aut.addEventListener("click", () => {
		const [aut, wsl, lit] = [
			put_s(`管理员：（最多${lim_aut.aut}名）`, pas.aut.aut.join(",")),
			put_s(`法律援助编辑：（最多${lim_aut.wsl}名）`, pas.aut.wsl.join(",")),
			put_s(`理论学习编辑：（最多${lim_aut.lit}名）`, pas.aut.lit.join(",")),
		]
		const btn = btn_pos(pas, `#${pas.usr}`, () => ({
			put: "aut",
			aut: aut.val().split(",").map(v => parseInt(v)).filter(is_id),
			wsl: wsl.val().split(",").map(v => parseInt(v)).filter(is_id),
			lit: lit.val().split(",").map(v => parseInt(v)).filter(is_id),
		}))
		article(aut.bind, wsl.bind, lit.bind, btn)
	}); else b.aut.remove()
	if (is_aut(pas.aut, pas.usr) || is_in(pas.sec)) b.usr.addEventListener("click", () => {
		const [adm, nbr] = [put_adm(), put_s("激活手机号：")]
		const btn = btn_pos(pas, `#${pas.usr}`, () => ({ pre: "usr", nbr: nbr.val(), ...adm.val() }))
		article(adm.bind, nbr.bind, btn)
	}); else b.usr.remove()
	if (is_aut(pas.aut.aut, pas.usr)) b.soc.addEventListener("click", () => {
		const [adm, nam] = [put_adm(), put_s("名称：（2-16个中文字符）")]
		const btn = btn_pos(pas, `#${pas.usr}`, () => ({ pre: "soc", nam: nam.val(), ...adm.val() }))
		article(adm.bind, nam.bind, btn)
	}); else b.soc.remove()
	return b.bind
}

export function btn_pos(
	pas: Pas,
	h: string,
	p: () => Pos | null,
	del?: Put,
): Bind {
	const b = section("btn_pos")
	if (del) b.del.addEventListener("click", async () => {
		if (!is_put(pas, del) || !confirm("确认删除？")) return
		b.del.disabled = b.put.disabled = b.ret.disabled = true
		if (await pos(del)) return hash(h)
		alert("删除失败")
		b.del.disabled = b.put.disabled = b.ret.disabled = false
	}); else b.del.remove()
	b.put.addEventListener("click", async () => {
		b.del.disabled = b.put.disabled = b.ret.disabled = true
		const d = p()
		if (d && is_pos(pas, d) && await pos(d) != null) return setTimeout(() => hash(h), utc_rf)
		alert("无效输入")
		b.del.disabled = b.put.disabled = b.ret.disabled = false
	})
	b.ret.addEventListener("click", () => hash(h))
	return b.bind
}

export function btn_soc(
	pas: Pas,
	d: NonNullable<QueRet["soc"]>,
): Bind {
	const b = section("btn_soc")
	if (is_aut(pas.aut.aut, pas.usr)) b.aut.addEventListener("click", () => {
		const [nam, adm, sec] = [
			put_s("俱乐部名称：（2-16个中文字符）", d.nam),
			put_adm({ adm1: d.adm1, adm2: d.adm2 }),
			put_s(`联络员员：（最多${lim_sec}名）`, d.sec.map(s => s[0]).join(",")),
		]
		const btn = btn_pos(pas, `#s${d._id}`, () => ({
			put: "soc", soc: d._id, nam: nam.val(), ...adm.val(),
			sec: sec.val().split(",").map(v => parseInt(v)).filter(is_id),
		}))
		article(nam.bind, adm.bind, sec.bind, btn)
	}); else b.aut.remove()
	if (is_in(pas.sec, d._id)) {
		b.msg.addEventListener("click", () => {
			const msg = put_t("俱乐部简介：", d.msg, lim_msg_id)
			const btn = btn_pos(pas, `#s${d._id}`, () => ({ put: "soc", soc: d._id, msg: msg.val() }))
			article(msg.bind, btn)
		})
		b.agr.addEventListener("click", () => {
			const agr = put_t("协议：", d.agr.msg, lim_msg)
			const btn = btn_pos(pas, `#s${d._id}`, () => ({ put: "soc", soc: d._id, agr: agr.val() }))
			article(agr.bind, btn)
		})
		b.agd.addEventListener("click", () => {
			const nam = put_s("活动名称：（2-16个中文字符）")
			const btn = btn_pos(pas, `#s${d._id}`, () => ({ pre: "agd", nam: nam.val(), soc: d._id }))
			article(nam.bind, btn)
		})
		b.cdt.addEventListener("click", () => {
			const utc = Date.now()
			const [usr, msg, amt, eft, exp] = [
				put_s("用户ID：（数字）"),
				put_s("积分类型：（如 '开通会员' '会员续费' 等）"),
				put_s("积分额度：（整数）"),
				put_s("生效日期：（同时最多有一次生效积分）", utc_dt(utc, "short")),
				put_s("有效天数：", "30"),
			]
			const btn = btn_pos(pas, `#s${d._id}`, () => ({
				pre: "cdt", cdt: {
					_id: { usr: parseInt(usr.val()), soc: d._id, utc },
					msg: msg.val(), amt: parseInt(amt.val()), sec: pas.usr,
					utc: { eft: new Date(eft.val()).getTime(), exp: new Date(eft.val()).getTime() + utc_d * parseInt(exp.val()), agr: 0 }
				}
			}))
			article(...[usr, msg, amt, eft, exp].map(el => el.bind), btn)
		})
		b.ern.addEventListener("click", () => {
			const [usr, msg, amt] = [
				put_s("用户ID：（数字）"),
				put_s("贡献内容：（如 '工作半天'）"),
				put_s("贡献额度：（整数）"),
			]
			const btn = btn_pos(pas, `#s${d._id}`, () => ({
				pre: "ern", ern: {
					_id: { usr: parseInt(usr.val()), soc: d._id, utc: Date.now() },
					msg: msg.val(), amt: parseInt(amt.val()), sec: pas.usr,
				}
			}))
			article(...[usr, msg, amt].map(el => el.bind), btn)
		})
	} else[b.msg, b.agr, b.agd, b.cdt, b.ern].forEach(el => el.remove())
	if (is_in(pas.cdt, d._id)) b.dbt.addEventListener("click", () => {
		const [msg, amt] = [
			put_s("消费内容：（如 '线下活动'）"),
			put_s("消费额度：（整数）"),
		]
		const btn = btn_pos(pas, `#s${d._id}`, () => ({
			pre: "dbt", dbt: {
				_id: { usr: pas.usr, soc: d._id, utc: Date.now() },
				msg: msg.val(), amt: parseInt(amt.val()),
			}
		}))
		article(...[msg, amt].map(el => el.bind), btn)
	}); else b.dbt.remove()
	return b.bind
}

export function btn_agd(
	pas: Pas,
	d: NonNullable<QueRet["agd"]>,
): Bind {
	const b = section("btn_agd")
	b.put.addEventListener("click", () => {
		const [nam, adm, msg] = [
			put_s("活动名称：（2-16个中文字符）", d.nam),
			put_adm({ adm1: d.adm1, adm2: d.adm2 }),
			put_t("活动简介：", d.msg, lim_msg_id),
		]
		const btn = btn_pos(pas, `#s${d.soc[0]}`, () => ({
			put: "agd", agd: d._id, nam: nam.val(), ...adm.val(), msg: msg.val(),
		}), { put: "agd", agd: d._id })
		article(lp("", [[d.soc[1], `#s${d.soc[0]}`, "cdt"]], false), nam.bind, adm.bind, msg.bind, btn)
	})
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
	if (s.length > 0) l.innerText = s
	else l.remove()
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
