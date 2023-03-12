import type { Fund, Id, Lit, Md, Work, Wsl } from "../../src/eid/typ.ts"
import type { Pas, PasCode, PreUsr } from "../../src/pra/pos.ts"
import type { DocC, DocD, DocU } from "../../src/db.ts"
import type * as Q from "../../src/pra/que.ts"
import { is_aut } from "../../src/eid/is.ts"
import { is_pro_usr, is_re, is_ref, is_rej, is_sec, is_uid } from "../../src/pra/con.ts"
import { nav, navhash, navnid, navpas } from "./nav.ts"
import { acct, btn, cover, goal, idnam, meta, putpro, putrel, re, rec as srec, rel, rolref, seladm, txt, ida } from "./section.ts"
import { bind, main, pas_a, pos, que } from "./template.ts"
import { is_actid, is_goal, is_img, is_msg, is_nam, is_nbr, is_url, } from "../../src/eid/is.ts"
import { utc_medium, utc_short } from "../../src/ont/utc.ts"

export function pas(
) {
	if (nav.pas) { navhash(`${nav.pas.uid}`); return }
	if (navhash("pas")) return

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
	const froze = is_rej(u) && !(nav.pas && (is_aut(nav.pas.aut, "aut") || is_sec(nav.pas)))

	navnid()
	main.innerHTML = ""
	const t = bind("usr")

	idnam(t, `${uid}`, froze ? "" : u.nam, meta(t, u))
	rolref(t.rolref, u)
	re(t, u)
	srec(t, "uid", u, froze)

	if (froze) [t.nam, t.intro].forEach(el => el.classList.add("froze"))
	else t.intro.innerText = u.intro

	if (nav.pas) {
		if (nav.pas.uid === uid) {
			pas_a.innerText = u.nam
			t.put.addEventListener("click", () => put("用户", u))
			t.pas.addEventListener("click", async () => {
				await pos("pas", { uid: nav.pas!.uid })
				navpas(null)
			})
			if (is_aut(nav.pas.aut, "aut") || is_sec(nav.pas)) {
				if (is_re(nav.pas)) t.preusr.addEventListener("click", () => pre("用户"))
				else t.preusr.disabled = true
			} else t.preusr.remove()
			if (is_aut(nav.pas.aut, "aut")) {
				if (is_re(nav.pas)) t.presoc.addEventListener("click", () => pre("社团"))
				else t.presoc.disabled = true
			} else t.presoc.remove()
			if (is_aut(nav.pas.aut, "aut")) {
				if (is_re(nav.pas)) t.preagd.addEventListener("click", () => pre("活动"))
				else t.preagd.disabled = true
			} else t.preagd.remove()
			btn(t.prefund, t.prefund.innerText, {
				prompt1: "输入订单号",
				confirm: "订单号只能激活或绑定一位用户。确认使用？",
				alert: "无效订单号，或订单号已被使用",
				pos: (actid) => actid ? pos("pre", { actid }) : null,
				refresh: () => usr(u._id),
			})
			if (is_aut(nav.pas.aut, "wsl")) btn(t.prewsl, t.prewsl.innerText, is_re(nav.pas) ? {
				prompt1: "输入文章标题：（2-16个中文字符）",
				pos: (wslnam) => is_nam(wslnam!) ? pos<DocC<Wsl["_id"]>>("pre", { wslnam }) : null,
				alert: "无效标题\n文章标题为 2-16 个中文字符",
				refresh: (wslid) => md("wsl", wslid, "one"),
			} : undefined); else t.prewsl.remove()
			if (is_aut(nav.pas.aut, "lit")) btn(t.prelit, t.prelit.innerText, is_re(nav.pas) ? {
				prompt1: "输入文章标题：（2-16个中文字符）",
				pos: (litnam) => is_nam(litnam!) ? pos<DocC<Lit["_id"]>>("pre", { litnam }) : null,
				alert: "无效标题\n文章标题为 2-16 个中文字符",
				refresh: (litid) => md("lit", litid, "one"),
			} : undefined); else t.prelit.remove()
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
		const froze = is_rej(s) && !(nav.pas && (is_aut(nav.pas.aut, "aut") || is_sec(nav.pas, { sid: s._id })))

		const t = bind("soc")
		idnam(t, `s${s._id}`, s.nam, meta(t, s))
		rel(t, s)
		srec(t, "sid", s, froze)

		if (froze) [t.nam, t.intro].forEach(el => el.classList.add("froze"))
		else t.intro.innerText = s.intro

		if (nav.pas) {
			if (is_aut(nav.pas.aut, "aut") || is_sec(nav.pas, { sid: s._id }))
				t.put.addEventListener("click", () => put("社团", s))
			else t.put.remove()
			putrel(t, "sid", s, () => soc(s._id))
			putpro(t, "sid", s, is_aut(nav.pas.aut, "aut") ? () => soc(s._id) : undefined)
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
		const froze = is_rej(a) && !(nav.pas && (is_aut(nav.pas.aut, "aut") || is_sec(nav.pas, { aid: a._id })))

		const t = bind("agd")
		idnam(t, `a${a._id}`, a.nam, meta(t, a))
		rel(t, a)
		cover(t, a)
		acct(t, a)
		goal(t.goal, a)
		srec(t, "aid", a, froze)

		if (froze) [t.nam, t.intro].forEach(el => el.classList.add("froze"))
		else t.intro.innerText = a.intro

		if (nav.pas) {
			if (is_aut(nav.pas.aut, "aut") || is_sec(nav.pas, { aid: a._id }))
				t.put.addEventListener("click", () => put("活动", a))
			else t.put.remove()
			if (is_sec(nav.pas, { aid: a._id })) {
				btn(t.putimg, t.putimg.innerText, {
					prompt1: "输入要增删或编辑的图片名（2-16个中文字符）",
					prompt2: "输入图片外链，或留空以删除图片",
					alert: "无效输入，或图片数已达上限（9张）",
					pos: (nam, src) => {
						if (!is_nam(nam!)) return null
						let img = a.img.filter(m => m.nam !== nam)
						if (src && src.length > 0) img = [{ nam, src }, ...img]
						return is_img(img) ? pos("put", { aid: a._id, img }) : null
					},
					refresh: () => agd(a._id),
				})
				btn(t.putgoal, t.putgoal.innerText, {
					prompt1: "输入要增删或编辑的目标名（2-16个中文字符）",
					prompt2: "输入目标进度（0-100），或留空以删除目标",
					alert: "无效输入，或目标数已达上限（9个）",
					pos: (nam, pct) => {
						if (!is_nam(nam!)) return null
						let g = a.goal.filter(m => m.nam !== nam)
						if (pct && pct.length > 0) g = [{ nam, pct: parseInt(pct) }, ...g]
						return is_goal(g) ? pos("put", { aid: a._id, goal: g }) : null
					},
					refresh: () => agd(a._id),
				})
				btn(t.prevideo, t.prevideo.innerText, {
					prompt1: "输入视频标题（2 - 256 个字符）",
					prompt2: "输入视频外链",
					alert: "无效输入",
					pos: (nam, src) => {
						if (!is_msg(nam!) || !is_url(src!)) return null
						return pos("pre", { aid: a._id, nam, src })
					},
					refresh: () => agd(a._id),
				})
			} else {
				t.putimg.remove()
				t.putgoal.remove()
				t.prevideo.remove()
			}
			if (is_uid(nav.pas, { aid: a._id })) btn(t.prework, t.prework.innerText, {
				prompt1: "输入工作日志（2-256 个字符，\\n 为换行符）",
				pos: msg => {
					if (!is_msg(msg!)) return null
					msg = msg.replaceAll("\\n", "\n")
					return pos("pre", { aid: a._id, msg })
				},
				alert: "无效输入",
				refresh: () => agd(a._id),
			}); else t.prework.remove()
			putrel(t, "aid", a, () => agd(a._id))
			putpro(t, "aid", a, is_aut(nav.pas.aut, "aut") ? () => agd(a._id) : undefined)
		} else {
			t.pos.remove()
			t.putrel.remove()
			t.putpro.remove()
		}

		main.append(t.bind)
	}
}

export type Rec = Omit<NonNullable<Q.Rec>, "unam" | "anam"> & {
	unam: Map<Id["_id"], Id["nam"]>,
	anam: Map<Id["_id"], Id["nam"]>,
}

export function rec(
	c: "work" | "fund",
	r: Rec,
	d: Rec["rec"][0],
): DocumentFragment {
	const t = bind("rec")
	const aid = d._id.aid
	t.unam.innerText = r.unam.get(d._id.uid)!
	t.unam.href = `#${d._id.uid}`
	t.anam.innerText = r.anam.get(aid)!
	t.anam.href = `#a${aid}`
	t.meta.innerText = utc_short(d._id.utc)
	if (c === "work") {
		const w = d as Work
		const froze = !is_re(w) && !(nav.pas && (is_aut(nav.pas.aut, "aut") || is_sec(nav.pas, { aid }) || is_uid(nav.pas, { aid })))
		if (is_rej(w)) {
			t.meta.innerText += "（反对者达两名，不公示）";
			[t.meta, t.msg].forEach(el => el.classList.add("rej2"))
		} else if (!is_ref(w)) {
			t.meta.innerText += "（推荐人未达两名，不公示）";
			[t.meta, t.msg].forEach(el => el.classList.add("ref2"))
		}
		if (w.ref.length !== 0 && w._id.uid === nav.pas?.uid) t.meta.innerText += "（有推荐人，不可编辑）"
		if (!froze) switch (w.work) {
			case "work": {
				t.msg.innerText = w.msg
				break
			} case "video": {
				t.msg.innerText = "发布了视频："
				const a = t.msg.appendChild(document.createElement("a"))
				a.innerText = w.nam
				a.href = w.src
				break
			}
		}
		ida(t.rej, w.rej.map(uid => [`${uid}`, r.unam.get(uid)!]))
		ida(t.ref, w.ref.map(uid => [`${uid}`, r.unam.get(uid)!]))
		if (nav.pas) {
			const refresh = async () => {
				const q = await que<Q.Rec>(`rec?c=work&uid=${w._id.uid}&aid=${w._id.aid}&utc=${w._id.utc}`)
				if (q) t.rec.replaceWith(rec(c, { ...q, unam: new Map(q.unam), anam: new Map(q.anam) }, q.rec[0]))
			}
			putpro(t, "workid", w, refresh)
			if (!is_uid(nav.pas, { aid })) t.putrej.remove()
			if (!is_sec(nav.pas, { aid })) t.putref.remove()
			if (w.ref.length === 0 && w._id.uid === nav.pas.uid) {
				const prompt1 = w.work === "work"
					? "输入工作日志（2-256 个字符，\\n 为换行符，留空以删除日志）"
					: "输入视频标题（2 - 256 个字符，留空以删除日志）"
				let del = false
				btn(t.put, t.put.innerText, {
					prompt1, prompt2: w.work === "work" ? undefined : "输入视频外链",
					pos: (p1, p2) => {
						del = !p1
						return pos("put", del ? { workid: w._id } : w.work === "work"
							? { workid: w._id, msg: p1!.replaceAll("\\n", "\n") }
							: { workid: w._id, nam: p1!, src: p2! }
						)
					},
					alert: "无效输入",
					refresh: () => del ? t.rec.remove() : refresh()
				})
			} else t.put.remove()
		} else t.putpro.remove()
	} else if (c === "fund") {
		const f = d as Fund
		const amount = f.fund > 0 ? `提供支持：+${f.fund}\n` : ""
		t.msg.innerText = `${amount}${f.msg}`
		t.re.remove()
	}
	return t.bind
}

export async function md(
	c: "wsl" | "lit",
	id: Md["_id"],
	op: "one" | "many" | "continue",
) {
	nav.cont = null
	if (op === "one" && navhash(`${c}${id}`)) return
	if ((op === "many" || op === "continue") && navhash(c)) return
	const f = op === "one" ? "" : `&f`
	const q = await que<Q.Md>(`md?${c}id=${id}${f}`)

	if (op === "one" && (!q || q.md.length === 0)) return idn(`${c}${id}`, "文章")
	if (op !== "continue") { navnid(); main.innerHTML = "" }
	if (!q) return

	const unam = new Map(q.unam)
	for (const m of q.md) {
		const t = bind("md")
		idnam(t, `${c}${m._id}`, m.nam)
		t.utc.innerText = utc_medium(m.utc)
		t.utcp.innerText = utc_medium(m.utcp)
		ida(t.unam, [[`${m.uid}`, unam.get(m.uid)!]])
		t.md.innerText = m.md
		if (nav.pas && m.uid === nav.pas.uid && is_aut(nav.pas.aut, c)) {
			if (is_re(nav.pas)) t.put.addEventListener("click", () => putmd(c, m))
			else t.put.disabled = true
		} else t.put.remove()
		main.append(t.bind)
	}

	if (op !== "one") setTimeout(() => {
		nav.cont = q.md.length === 0 ? null
			: () => md(c, q.md[q.md.length - 1]._id, "continue")
	}, 100)
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
	id: Usr | Soc | Agd,
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
			const [isaut, issec] = [is_aut(nav.pas.aut, "aut"), is_sec(nav.pas, { sid: id._id })]
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
			const [isaut, issec] = [is_aut(nav.pas.aut, "aut"), is_sec(nav.pas, { aid: id._id })]
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
	if (nam === "用户" || !is_aut(nav.pas.aut, "aut") || !is_re(nav.pas)) t.putn.remove()
	else btn(t.putn, `删除${nam}`, {
		prompt1: `确认要删除的${nam}名称\n只能删除${nam === "社团" ? "无志愿者的社团" : "无工作日志，无支持记录的活动"}`,
		confirm: `确认要删除${nam}?`,
		pos: p1 => {
			if (p1 !== id.nam) return null
			return pos<DocD>("put", { [nam === "社团" ? "sid" : "aid"]: id._id })
		},
		alert: `${nam}名称有误\n${nam === "社团" ? "或社团仍有志愿者" : "或活动仍有工作日志或支持记录"}`,
		refresh: () => nam === "社团" ? soc() : agd(),
	})
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

function putmd(
	c: "wsl" | "lit",
	m: Md,
) {
	if (!nav.pas) return

	main.innerHTML = ""
	const t = bind("putmd")

	idnam(t, `${c}${m._id}`, "编辑文章")
	t.pnam.value = m.nam
	txt(t.md, "正文", m.md)

	btn(t.putn, t.putn.innerText, {
		confirm: "删除文章？",
		pos: () => pos<DocD>("put", { [`${c}id`]: m._id }),
		refresh: () => md(c, 0, "many")
	})
	btn(t.put, t.put.innerText, {
		pos: () => pos<DocU>("put", { [`${c}id`]: m._id, nam: t.pnam.value, md: t.md.value.trim() }),
		alert: `无效输入\n文章标题为 2-16 个中文字符\n正文最长 ${t.md.maxLength} 个字符`,
		refresh: () => md(c, m._id, "one")
	})
	t.cancel.addEventListener("click", () => md(c, m._id, "one"))

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
