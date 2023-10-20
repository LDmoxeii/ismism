import type { Id } from "../../src/eid/typ.ts"
import { is_nbr } from "../../src/eid/is.ts"
import { utc_dt } from "../../src/ont/utc.ts"
import { PsgRet } from "../../src/pra/pas.ts"
import { pos } from "./fetch.ts"
import { bind } from "./template.ts"
import { hash, navpas } from "./nav.ts"

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
