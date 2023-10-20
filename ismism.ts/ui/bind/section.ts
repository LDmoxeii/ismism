import type { Id } from "../../src/eid/typ.ts"
import type { PsgRet } from "../../src/pra/pas.ts"
import { is_nbr, lim_msg_id } from "../../src/eid/is.ts"
import { utc_dt } from "../../src/ont/utc.ts"
import { pos } from "./fetch.ts"
import { bind, main } from "./template.ts"
import { hash, nav, navpas, utc_rf } from "./nav.ts"
import { QueRet } from "../../src/pra/que.ts"
import { adm, adm1_def, adm2_def } from "../../src/ont/adm.ts"
import { Put } from "../../src/pra/pos.ts"
import { is_put } from "../../src/pra/can.ts"

export function idn(
	id: string,
	nam: string,
	mta?: string,
) {
	const b = bind("id")
	b.id.innerText = id
	b.nam.innerText = nam
	b.idnam.href = ""
	if (mta) b.mta.innerText = mta
	return b.bind
}

export function id(
	d: Id,
	p: "" | "s" | "a" = "",
): DocumentFragment {
	const b = bind("id")
	b.id.innerText = `${p}${d._id}`
	b.nam.innerText = d.nam
	b.idnam.href = `#${p}${d._id}`
	b.mta.innerText = `城市：${d.adm1} ${d.adm2}`
		+ `\n注册：${utc_dt(d.utc, "short")}`
	b.msg.innerText = d.msg
	return b.bind
}

export function sms(
): DocumentFragment {
	const [s, c] = [bind("sms"), bind("code")]
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

export function put_id(
	d: Id,
): { bind: DocumentFragment, val: () => Pick<Id, "nam" | "adm1" | "adm2" | "msg"> } {
	const b = bind("put_id")
	b.nam.value = d.nam
	seladm(b, d)
	txt(b.msg, "简介", lim_msg_id, d.msg)
	return {
		bind: b.bind, val: () => ({
			nam: b.nam.value,
			adm1: b.adm1.value, adm2: b.adm2.value,
			msg: b.msg.value,
		})
	}
}

export function btn_usr(
	d: NonNullable<QueRet["usr"]>,
): DocumentFragment {
	const b = bind("btn_usr")
	b.put.addEventListener("click", () => {
		main.innerHTML = ""
		const t = main.appendChild(document.createElement("article"))
		const put = put_id(d)
		const btn = btn_put(`#${d._id}`, () => ({ put: "usr", usr: d._id, ...put.val() }))
		t.append(put.bind, btn)
	})
	b.clr.addEventListener("click", async () => {
		const usr = nav.pas?.usr
		if (usr) await pos({ psg: "clr", usr })
		navpas(null)
		hash(usr ? `#${usr}` : "")
	})
	return b.bind
}

export function btn_put(
	h: string,
	put: () => Put | null,
	del?: Put,
): DocumentFragment {
	const b = bind("btn_put")
	if (del) b.del.addEventListener("click", async () => {
		if (!is_put(nav.pas!, del) || !confirm("确认删除？")) return
		b.del.disabled = b.put.disabled = b.ret.disabled = true
		if (await pos(del)) return hash(h)
		alert("删除失败")
		b.del.disabled = b.put.disabled = b.ret.disabled = false
	}); else b.del.remove()
	b.put.addEventListener("click", async () => {
		b.del.disabled = b.put.disabled = b.ret.disabled = true
		const p = put()
		if (p && is_put(nav.pas!, p) && await pos(p)) return setTimeout(() => hash(h), utc_rf)
		alert("无效输入")
		b.del.disabled = b.put.disabled = b.ret.disabled = false
	})
	b.ret.addEventListener("click", () => hash(h))
	return b.bind
}

function label(
	el: HTMLElement | SVGSVGElement,
	s: string,
	append = false
) {
	const l = el.previousElementSibling as HTMLLabelElement
	if (append) l.innerText += s
	else l.innerText = s
}

function txt(
	t: HTMLTextAreaElement,
	n: string,
	lim: number,
	s?: string,
) {
	t.maxLength = lim
	if (s) t.value = s
	label(t, `${n}：（${t.value.length}/${t.maxLength} 个字符）`)
	t.addEventListener("input", () => {
		label(t, `${n}：（${t.value.length}/${t.maxLength} 个字符）`)
		t.style.height = "auto"
		t.style.height = `${t.scrollHeight}px`
	})
	if (s) setTimeout(() => t.dispatchEvent(new Event("input")), 50)
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

function seladm(
	t: { adm1: HTMLSelectElement, adm2: HTMLSelectElement },
	d = { adm1: adm1_def, adm2: adm2_def },
) {
	selopt(t.adm1, adm.keys())
	t.adm1.value = d.adm1
	selopt(t.adm2, adm.get(d.adm1)!)
	t.adm2.value = d.adm2
	t.adm1.addEventListener("change", () => selopt(t.adm2, adm.get(t.adm1.value)!))
}
