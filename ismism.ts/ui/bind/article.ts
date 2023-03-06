import type { Id } from "../../src/eid/typ.ts"
import type { Pas, PasCode, PreUsr } from "../../src/pra/pos.ts"
import type { DocC, DocU } from "../../src/db.ts"
import type * as Q from "../../src/pra/que.ts"
import { is_pre_agd, is_pre_soc, is_pre_usr, is_pro_usr, is_rej, is_sec } from "../../src/pra/con.ts"
import { nav, navhash, navnid, navpas } from "./nav.ts"
import { acct, btn, cover, goal, idnam, meta, putpro, putrel, re, rel, rolref, seladm, txt } from "./section.ts"
import { bind, main, pas_a, pos, que } from "./template.ts"
import { is_actid, is_nbr, } from "../../src/eid/is.ts"
import { utc_medium } from "../../src/ont/utc.ts"

export function pas(
) {
	if (navhash("pas")) return
	if (nav.pas) {
		pos("pas", { uid: nav.pas.uid })
		navpas(null)
	}

	navnid()
	main.innerHTML = ""
	const t = bind("pas")

	const send = async () => {
		if (!is_nbr(t.nbr.value)) return alert("无效手机号")
		t.nbr.readOnly = t.send.disabled = true
		const sent = await pos<PasCode>("pas", { nbr: t.nbr.value, sms: location.hostname === "ismist.cn" })
		if (sent) {
			const utc = sent.utc ? `\n上次发送：${utc_medium(sent.utc)}` : ""
			t.hint.innerText = `验证码已发送，可多次使用\n一小时内不再重复发送${utc}`
			t.pas.classList.remove("none")
		} else {
			t.hint.innerText = `手机号未注册\n输入居住地与注册激活码\n激活码只能使用一次，确认手机号无误`
			seladm(t)
			t.adm.classList.remove("none")
			t.pre.classList.remove("none")
		}
	}
	t.send.addEventListener("click", send)

	t.act.addEventListener("click", async () => {
		if (!is_actid(t.actid.value)) return alert("无效激活码")
		t.actid.readOnly = t.act.disabled = t.adm1.disabled = t.adm2.disabled = true
		const uid = await pos<PreUsr>("pre", { actid: t.actid.value, nbr: t.nbr.value, adm1: t.adm1.value, adm2: t.adm2.value })
		if (uid) {
			await send()
			t.pas.classList.remove("none")
		} else {
			t.actid.readOnly = t.act.disabled = t.adm1.disabled = t.adm2.disabled = false
			alert("无效激活码")
		}
	})

	t.issue.addEventListener("click", async () => {
		if (!t.code.checkValidity()) return alert("无效验证码")
		t.code.readOnly = t.issue.disabled = true
		const p = await pos<Pas>("pas", { nbr: t.nbr.value, code: parseInt(t.code.value) })
		if (!p) {
			t.code.readOnly = t.issue.disabled = false
			return alert("无效验证码")
		}
		navpas(p)
		usr(p.uid)
	})

	main.append(t.bind)

}

export type Usr = Omit<NonNullable<Q.Usr>, "unam" | "snam" | "anam"> & {
	unam: Map<Id["_id"], Id["nam"]>,
	snam: Map<Id["_id"], Id["nam"]>,
	anam: Map<Id["_id"], Id["nam"]>,
}
export async function usr(
	uid: number
) {
	if (navhash(`${uid}`)) return

	const q = await que<Q.Usr>(`usr?uid=${uid}`)
	if (!q) return idn(`${uid}`, "用户")
	const u: Usr = { ...q, unam: new Map(q.unam), snam: new Map(q.snam), anam: new Map(q.anam) }
	const froze = is_rej(u) && !(nav.pas && (nav.pas.aut || is_sec(nav.pas)))

	navnid()
	main.innerHTML = ""
	const t = bind("usr")

	idnam(t, `${uid}`, froze ? "" : u.nam, meta(t, u))
	rolref(t.rolref, u)
	re(t, u)

	if (froze) [t.nam, t.intro, t.rec].forEach(el => el.classList.add("froze"))
	else {
		t.intro.innerText = u.intro
		t.rec.innerText = JSON.stringify(u.nrec)
	}

	if (nav.pas) {
		if (nav.pas.uid === uid) {
			pas_a.innerText = u.nam
			t.put.addEventListener("click", () => put("用户", u))
			t.pas.addEventListener("click", pas)
			if (is_pre_usr(nav.pas)) t.preusr.addEventListener("click", () => pre("用户"))
			else t.preusr.remove()
			if (is_pre_soc(nav.pas)) t.presoc.addEventListener("click", () => pre("社团"))
			else t.presoc.remove()
			if (is_pre_agd(nav.pas)) t.preagd.addEventListener("click", () => pre("活动"))
			else t.preagd.remove()
			btn(t.prefund, t.prefund.innerText, {
				prompt1: "输入订单号",
				confirm: "订单号只能激活或绑定一位用户。确认使用？",
				alert: "无效订单号，或订单号已被使用",
				pos: (actid) => actid ? pos("pre", { actid }) : null,
				refresh: () => usr(u._id),
			})
			t.putpro.remove()
		} else {
			t.pos.remove()
			t.pre.remove()
			putpro(t, "uid", u, is_pro_usr(nav.pas, "rej", u._id) ? () => usr(u._id) : undefined)
		}
	} else {
		t.pos.remove()
		t.pre.remove()
		t.putpro.remove()
	}

	main.append(t.bind)
}

function doc<T>(
	q: "soc" | "agd",
	adm: string,
) {
	const [a1, a2] = (adm).split("-")
	if (a2) {
		navnid(q, a1, a2)
		return que<T[]>(`${q}?adm2=${a2}`)
	} else if (a1) {
		navnid(q, a1)
		return que<T[]>(`${q}?adm1=${a1}`)
	} else {
		navnid(q)
		return que<T[]>(q)
	}
}

export type Soc = Omit<NonNullable<Q.Soc>, "unam"> & {
	unam: Map<Id["_id"], Id["nam"]>,
}
export async function soc(
	sidadm?: number | string
) {
	if (navhash(typeof sidadm === "number" ? `s${sidadm}` : `soc${sidadm ?? ""}`)) return
	let ss: Q.Soc[]
	if (typeof sidadm === "number") {
		ss = [await que<Q.Soc>(`soc?sid=${sidadm}`)]
		navnid()
	} else ss = await doc<Q.Soc>("soc", sidadm ?? "")

	ss = ss.filter(s => s)
	if (typeof sidadm === "number" && ss.length === 0) return idn(`s${sidadm}`, "社团")

	main.innerHTML = ""
	for (const d of ss) {
		if (!d) continue

		const s: Soc = { ...d, unam: new Map(d.unam) }
		const froze = is_rej(s) && !(nav.pas && (nav.pas.aut || is_sec(nav.pas, { sid: s._id })))

		const t = bind("soc")
		idnam(t, `s${s._id}`, s.nam, meta(t, s))
		rel(t, s)

		if (froze) [t.nam, t.intro, t.rec].forEach(el => el.classList.add("froze"))
		else {
			t.intro.innerText = s.intro
			t.rec.innerText = JSON.stringify(s.nrec)
		}

		if (nav.pas) {
			if (nav.pas.aut || is_sec(nav.pas, { sid: s._id }))
				t.put.addEventListener("click", () => put("社团", s))
			else t.put.remove()
			putrel(t, "sid", s, () => soc(s._id))
			putpro(t, "sid", s, nav.pas.aut ? () => soc(s._id) : undefined)
		} else {
			t.pos.remove()
			t.putrel.remove()
			t.putpro.remove()
		}

		main.append(t.bind)
	}
}

export type Agd = Omit<NonNullable<Q.Agd>, "unam"> & {
	unam: Map<Id["_id"], Id["nam"]>,
}
export async function agd(
	aidadm?: number | string
) {
	if (navhash(typeof aidadm === "number" ? `a${aidadm}` : `agd${aidadm ?? ""}`)) return
	let aa: Q.Agd[]
	if (typeof aidadm === "number") {
		aa = [await que<Q.Agd>(`agd?aid=${aidadm}`)]
		navnid()
	} else aa = await doc<Q.Agd>("agd", aidadm ?? "")

	aa = aa.filter(a => a)
	if (typeof aidadm === "number" && aa.length === 0) return idn(`a${aidadm}`, "活动")

	main.innerHTML = ""
	for (const d of aa) {
		if (!d) continue

		const a: Agd = { ...d, unam: new Map(d.unam) }
		const froze = is_rej(a) && !(nav.pas && (nav.pas.aut || is_sec(nav.pas, { aid: a._id })))

		const t = bind("agd")
		idnam(t, `a${a._id}`, a.nam, meta(t, a))
		rel(t, a)
		cover(t, a)
		acct(t, a)
		goal(t.goal, a)

		if (froze) [t.nam, t.intro, t.rec].forEach(el => el.classList.add("froze"))
		else {
			t.intro.innerText = a.intro
			t.rec.innerText = JSON.stringify(a.nrec)
		}

		if (nav.pas) {
			if (nav.pas.aut || is_sec(nav.pas, { aid: a._id }))
				t.put.addEventListener("click", () => put("活动", a))
			else t.put.remove()
			putrel(t, "aid", a, () => agd(a._id))
			putpro(t, "aid", a, nav.pas.aut ? () => agd(a._id) : undefined)
		} else {
			t.pos.remove()
			t.putrel.remove()
			t.putpro.remove()
		}

		main.append(t.bind)
	}
}

export function wsl(
) {

}
export function lit(
) {

}
function pre(
	nam: "用户" | "社团" | "活动",
) {
	if (!nav.pas) return
	navnid()
	main.innerHTML = ""
	const t = bind("pre")

	idnam(t, `${nav.pas.uid}`, `添加${nam}`)
	seladm(t)

	// deno-lint-ignore no-explicit-any
	let p: () => any
	let r: (id: Id["_id"]) => void
	switch (nam) {
		case "用户": {
			t.pnam.parentElement?.remove()
			p = () => ({ nbr: t.nbr.value, adm1: t.adm1.value, adm2: t.adm2.value })
			r = usr
			break
		} case "社团": {
			t.nbr.parentElement?.remove()
			p = () => ({ snam: t.pnam.value, adm1: t.adm1.value, adm2: t.adm2.value })
			r = soc
			break
		} case "活动": {
			t.nbr.parentElement?.remove()
			p = () => ({ anam: t.pnam.value, adm1: t.adm1.value, adm2: t.adm2.value })
			r = agd
			break
		}
	}

	btn(t.pre, t.pre.innerText, {
		pos: () => pos<DocC<Id["_id"]>>("pre", p()),
		alert: `无效输入\n或${nam === "用户" ? "手机号" : "名称"}已被占用`,
		refresh: r,
	})
	t.cancel.addEventListener("click", () => usr(nav.pas!.uid))

	main.append(t.bind)
}

function put(
	nam: "用户" | "社团" | "活动",
	id: Usr | Soc,
) {
	if (!nav.pas) return
	navnid()
	main.innerHTML = ""
	const t = bind("put")

	idnam(t, `${id._id}`, `编辑${nam}信息`)
	t.pnam.value = id.nam
	seladm(t, id.adm1, id.adm2)
	txt(t.intro, "简介", id.intro)

	const pid = () => ({ nam: t.pnam.value, adm1: t.adm1.value, adm2: t.adm2.value, })
	const paut = () => ({ uidlim: parseInt(t.uidlim.value) })
	const psoc = () => ({ intro: t.intro.value.trim(), reslim: parseInt(t.reslim.value) })
	const pagd = () => ({
		account: t.account.value.trim(), budget: parseInt(t.budget.value),
		fund: parseInt(t.fund.value), expense: parseInt(t.expense.value)
	}) // deno-lint-ignore no-explicit-any
	let p: () => any[]
	let r
	switch (nam) {
		case "用户": {
			[t.uidlim, t.reslim, t.account, t.budget, t.fund, t.expense].forEach(el => el.parentElement?.remove())
			p = () => [{ uid: id._id, ...pid(), intro: t.intro.value.trim() }]
			r = () => usr(id._id)
			break
		} case "社团": {
			[t.account, t.budget, t.fund, t.expense].forEach(el => el.parentElement?.remove())
			const s = id as Soc
			t.uidlim.value = `${s.uidlim}`
			t.reslim.value = `${s.reslim}`
			const [isaut, issec] = [nav.pas.aut, is_sec(nav.pas, { sid: id._id })]
			t.pnam.readOnly = t.adm1.disabled = t.adm2.disabled = t.uidlim.readOnly = !isaut
			t.intro.readOnly = t.reslim.readOnly = !issec
			p = () => [
				...isaut ? [{ sid: id._id, ...pid(), ...paut() }] : [],
				...issec ? [{ sid: id._id, ...psoc() }] : [],
			]
			r = () => soc(id._id)
			break
		} case "活动": {
			const a = id as Agd
			t.uidlim.value = `${a.uidlim}`
			t.reslim.value = `${a.reslim}`
			t.account.value = a.account
			t.budget.value = `${a.budget}`
			t.fund.value = `${a.fund}`
			t.expense.value = `${a.expense}`
			const [isaut, issec] = [nav.pas.aut, is_sec(nav.pas, { aid: id._id })]
			t.pnam.readOnly = t.adm1.disabled = t.adm2.disabled = t.uidlim.readOnly = !isaut;
			[t.intro, t.reslim, t.account, t.budget, t.fund, t.expense].forEach(el => el.readOnly = !issec)
			p = () => [
				...isaut ? [{ aid: id._id, ...pid(), ...paut() }] : [],
				...issec ? [{ aid: id._id, ...psoc(), ...pagd() }] : [],
			]
			r = () => agd(id._id)
			break
		}
	}
	btn(t.put, t.put.innerText, {
		pos: async () => {
			const rs = await Promise.all(p().map(b => pos<DocU>("put", b)))
			return rs.some(r => r === null) ? null : 1
		},
		alert: "无效输入\n或名称已被占用",
		refresh: r,
	})
	t.cancel.addEventListener("click", r)

	main.append(t.bind)
}

export function idn(
	id: string, nam: string
) {
	navnid()
	main.innerHTML = ""

	const t = bind("idn")
	t.id.innerText = id
	t.meta.innerText = `ismist#${id} 是无效${nam}`

	main.append(t.bind)
}
