import type { Fund, Id, Md, Work } from "../../src/eid/typ.ts"
import type { Pas, PasCode, Pos, PreUsr } from "../../src/pra/pos.ts"
import type { DocC, DocD, DocU } from "../../src/db.ts"
import * as Q from "../../src/pra/que.ts"
import { is_aut, is_lim, is_md, lim_aud, lim_aut, lim_lit, lim_md, lim_md_pin, lim_ord_a, lim_sup, lim_url, lim_wsl } from "../../src/eid/is.ts"
import { is_pre_usr, is_pro_usr, is_re, is_ref, is_rej, is_sec, is_uid } from "../../src/pra/can.ts"
import { nav, navhash, navnid, navpas } from "./nav.ts"
import { acct, btn, cover, goal, idnam, meta, putpro, putrel, re, rec as srec, rel, rolref, seladm, txt, ida, wsllit, label, qrcode } from "./section.ts"
import { bind, main, pas_a, pos, PosB, que, utc_refresh } from "./template.ts"
import { is_actid, is_goal, is_img, is_msg, is_nam, is_nbr, is_url, } from "../../src/eid/is.ts"
import { utc_d, utc_date, utc_medium, utc_short } from "../../src/ont/utc.ts"

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

export async function id(
	h: "agd" | "soc",
	adm?: string,
) {
	const idl = await doc<[Id["_id"], Id["nam"]]>(h, adm ?? "")

	main.innerHTML = ""
	await live()
	const t = bind("id")

	const c = h === "agd" ? "活动公示" : "同城小组"
	idnam(t, `${h}${adm ?? ""}`, c)
	t.meta.innerText = "网站本月将开启\"以太假说\"杯评选活动的投票通道\n请参赛小组将图片、视频、介绍添加至小组的活动页面"
	label(t.idl, `${adm ?? ""} 共 ${idl.length} 个（按注册时间排序）`)
	ida(t.idl, idl.map(n => [`${h.substring(0, 1)}${n[0]}`, n[1]]), "id")

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
	const froze = is_rej(u) && !(nav.pas && (nav.pas.uid === u._id || is_pre_usr(nav.pas)))

	navnid()
	main.innerHTML = ""
	const t = bind("usr")

	idnam(t, `${uid}`, froze ? "" : u.nam, meta(t, u, u.aut))
	rolref(t.rolref, u)
	re(t, u)
	srec(t, "uid", u, froze)

	if (froze) [t.nam, t.intro].forEach(el => el.classList.add("froze"))
	else t.intro.innerText = u.intro

	if (nav.pas) {
		if (nav.pas.uid === uid) {
			pas_a.innerText = u.nam
			t.put.addEventListener("click", () => putid("用户", u))
			t.pas.addEventListener("click", async () => {
				if (nav.pas) await pos("pas", { uid: nav.pas.uid })
				navpas(null)
				usr(uid)
			})
			for (const a of ["aud", "aut"] as const) {
				const el = t[`pre${a}`]
				if (is_aut(nav.pas.aut, "sup")) el.addEventListener("click", () => put(`${uid}`, el.innerText, {
					nam: { p1: "用户名：" }, val: {}, p: "pre",
					b: p => p.p1 && is_nam(p.p1) ? { nam: p.p1, aut: a } : null,
					a: "无效用户名，或已达上限",
					r: async () => { await navpas(); aut() },
				})); else el.remove()
			}
			if (is_aut(nav.pas.aut) || is_sec(nav.pas)) t.preusr.addEventListener("click", () => pre("用户"))
			else t.preusr.remove()
			if (is_aut(nav.pas.aut, "aut")) {
				t.presoc.addEventListener("click", () => pre("小组"))
				t.preagd.addEventListener("click", () => pre("活动"))
			} else[t.presoc, t.preagd].forEach(el => el.remove())
			t.prefund.addEventListener("click", () => put(`${uid}`, t.prefund.innerText, {
				nam: { p1: `订单号：（6-${lim_url} 个字符）` }, val: {}, p: "pre",
				b: p => p.p1 && is_actid(p.p1) ? { actid: p.p1 } : null,
				a: "无效订单号，或订单号已被使用",
				r: () => usr(uid)
			}))
			wsllit(t)
			t.putpro.remove()
		} else {
			[t.pos, t.pre, t.wsllit].forEach(el => el.remove())
			putpro(t, "uid", u, is_pro_usr(nav.pas, "rej", u._id) ? () => usr(u._id) : undefined)
		}
	} else[t.pos, t.pre, t.wsllit, t.putpro].forEach(el => el.remove())

	main.append(t.bind)
}

export type Soc = Omit<NonNullable<Q.Soc>, "unam"> & {
	unam: Map<Id["_id"], Id["nam"]>,
}
export async function soc(
	sid: number
) {
	if (navhash(`s${sid}`)) return
	const ss: Q.Soc[] = [await que<Q.Soc>(`soc?sid=${sid}`)].filter(s => s)
	navnid()

	if (ss.length === 0) return idn(`s${sid}`, "小组")

	main.innerHTML = ""
	for (const d of ss) {
		if (!d) continue

		const s: Soc = { ...d, unam: new Map(d.unam) }
		const froze = s.rej.length > 0 && !(nav.pas && (is_sec(nav.pas, { sid: s._id }) || is_aut(nav.pas.aut)))

		const t = bind("soc")
		idnam(t, `s${s._id}`, s.nam, meta(t, s))
		rel(t, s)
		srec(t, "sid", s, froze)

		if (froze) [t.nam, t.intro].forEach(el => el.classList.add("froze"))
		else t.intro.innerText = s.intro

		if (nav.pas) {
			if (is_aut(nav.pas.aut, "aut") || is_sec(nav.pas, { sid: s._id }))
				t.put.addEventListener("click", () => putid("小组", s))
			else t.put.remove()
			putrel(t, "sid", s, async () => { await navpas(); soc(s._id) })
			if (is_aut(nav.pas.aut, "aud")) putpro(t, "sid", s, () => soc(s._id))
			else t.putpro.remove()
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
	aid: number
) {
	if (navhash(`a${aid}`)) return
	const aa: Q.Agd[] = [await que<Q.Agd>(`agd?aid=${aid}`)].filter(a => a)
	navnid()

	if (aa.length === 0) return idn(`a${aid}`, "活动")

	main.innerHTML = ""
	await live()
	for (const d of aa) {
		if (!d) continue

		const a: Agd = { ...d, unam: new Map(d.unam) }
		const froze = a.rej.length > 0 && !(nav.pas && (is_sec(nav.pas, { aid: a._id }) || is_aut(nav.pas.aut)))

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
			if (is_sec(nav.pas, { aid: a._id }) || is_uid(nav.pas, { aid: a._id })) {
				t.ord.parentElement?.classList.remove("none")
				if (a.ordlim > 0 && Date.now() - a.ordutc < utc_d) ida(t.ord, [[`ord${a._id}utc${a.ordutc}`, utc_date(a.ordutc)]])
			}
			if (is_aut(nav.pas.aut, "aut") || is_sec(nav.pas, { aid: a._id }))
				t.put.addEventListener("click", () => putid("活动", a))
			else t.put.remove()
			if (is_sec(nav.pas, { aid: a._id })) {
				t.putord.addEventListener("click", () => put(`a${a._id}`, t.putord.innerText, {
					nam: { p1: "今日份数：（0-128，编辑后重新计数）", p2: "单人单周份数：（周一起算）" }, val: { p1: `${a.ordlim}`, p2: `${a.ordlimw}` }, p: "put",
					b: p => {
						if (!p.p1 || !p.p2) return null
						return { aid: a._id, ordlim: parseInt(p.p1), ordlimw: parseInt(p.p2) }
					},
					a: "无效输入",
					r: () => agd(a._id),
				}))
				t.putimg.addEventListener("click", () => put(`a${a._id}`, t.putimg.innerText, {
					nam: { p1: "图片名：（2-16 个中文字符）", p2: "图片外链：（最长 128 个字符，或留空以删除图片）" }, val: {}, p: "put",
					b: p => {
						if (!p.p1 || !is_nam(p.p1)) return null
						let img = a.img.filter(m => m.nam !== p.p1)
						if (p.p2 && p.p2.length > 0) img = [{ nam: p.p1, src: p.p2 }, ...img]
						return is_img(img) ? { aid: a._id, img } : null
					},
					a: "无效输入，或图片数已达上限（9张）",
					r: () => agd(a._id),
				}))
				t.putgoal.addEventListener("click", () => put(`a${a._id}`, t.putgoal.innerText, {
					nam: { p1: "目标名：（2-16 个中文字符）", p2: "目标进度：（0- 100，或留空以删除目标）" }, val: {}, p: "put",
					b: p => {
						if (!p.p1 || !is_nam(p.p1)) return null
						let g = a.goal.filter(m => m.nam !== p.p1)
						if (p.p2 && p.p2.length > 0) g = [{ nam: p.p1, pct: parseInt(p.p2) }, ...g]
						return is_goal(g) ? { aid: a._id, goal: g } : null
					},
					a: "无效输入，或目标数已达上限（9个）",
					r: () => agd(a._id),
				}))
			} else {
				t.putord.remove()
				t.putimg.remove()
				t.putgoal.remove()
			}
			if (is_uid(nav.pas, { aid: a._id })) {
				t.prelive.addEventListener("click", () => put(`a${a._id}`, t.prelive.innerText, {
					nam: {
						p1: "直播标题：（2-256 个字符）", p2: "直播外链：（最长 128 个字符）",
						p3: "开播时间：（如 2023-3-26 11:30）", p4: "结束时间：",
					}, val: {}, p: "pre",
					b: p => {
						const [utcs, utce] = [p.p3, p.p4].map(d => new Date(d!).getTime())
						if (!p.p1 || !p.p2 || !is_msg(p.p1) || !is_url(p.p2) || isNaN(utcs) || isNaN(utce)) return null
						return { aid: a._id, nam: p.p1, src: p.p2, utcs, utce }
					},
					a: "无效输入\n直播标题为 2-256 个字符\n直播外链最长 128 个字符\n时间格式为 2023-3-26 11:30",
					r: () => agd(a._id),
				}))
				t.prevideo.addEventListener("click", () => put(`a${a._id}`, t.prevideo.innerText, {
					nam: { p1: "视频标题：（2-256 个字符）", p2: "视频外链：（最长 128 个字符）" }, val: {}, p: "pre",
					b: p => {
						if (!p.p1 || !p.p2 || !is_msg(p.p1) || !is_url(p.p2)) return null
						return { aid: a._id, nam: p.p1, src: p.p2 }
					},
					a: "无效输入\n视频标题为 2-256 个字符\n视频外链最长 128 个字符",
					r: () => agd(a._id),
				}))
				t.prework.addEventListener("click", () => put(`a${a._id}`, t.prework.innerText, {
					nam: { pa: "工作日志" }, val: {}, p: "pre", b: p => {
						if (!p.pa || !is_msg(p.pa)) return null
						return { aid: a._id, msg: p.pa.trim() }
					},
					a: "无效输入\n工作日志为 2-256 个字符",
					r: () => agd(a._id),
				}))
			} else[t.prelive, t.prevideo, t.prework].forEach(el => el.remove())
			putrel(t, "aid", a, async () => { await navpas(); agd(a._id) })
			if (is_aut(nav.pas.aut, "aud")) putpro(t, "aid", a, () => agd(a._id))
			else t.putpro.remove()
		} else {
			t.pos.remove()
			t.putrel.remove()
			t.putpro.remove()
		}

		main.append(t.bind)
	}
}

async function live(
) {
	const r = await que<Q.Live>("live")
	const utc = Date.now()
	const [unam, anam] = [new Map(r.unam), new Map(r.anam)]
	const live = {
		rec: r.live.filter(l => l.utcs < utc && utc < l.utce),
		unam, anam,
	}
	const livep = {
		rec: r.live.filter(l => utc < l.utcs),
		unam, anam
	}

	const t = bind("live")
	label(t.live, `（${live.rec.length}）`, true)
	label(t.livep, `（${livep.rec.length}）`, true)
	for (const l of live.rec) t.live.prepend(rec("work", live, l))
	for (const l of livep.rec) t.livep.prepend(rec("work", livep, l));
	(t.live.parentElement as HTMLDetailsElement).open = live.rec.length > 0

	main.append(t.bind)
}

export type Ord = Omit<NonNullable<Q.Ord>, "anam"> & {
	anam: Map<Id["_id"], Id["nam"]>,
}

export async function ordl(
	aidutc: string
) {
	const [aid, utc] = aidutc.split("utc").map(parseFloat)
	const [a, orda] = await Promise.all([
		que<Q.Agd>(`agd?aid=${aid}`),
		que<Q.Ord>(`ord?aid=${aid}`),
	])
	if (!a || a.ordutc !== utc || !orda) return idn(`ord${aid}`, "订单链接")
	const n = orda.ord.length

	main.innerHTML = ""
	const t = bind("ordl")

	if (nav.refresh === null) t.que.addEventListener("click", () => {
		nav.refresh = setInterval(() => ordl(aidutc), 15000)
		t.que.disabled = true
	})
	else t.que.disabled = true
	if (is_lim(n + 1, a.ordlim)) t.pre.addEventListener("click", () => put(`a${a._id}`, t.pre.innerText, {
		nam: { p1: `手机号：（一周可下${a.ordlimw}单，周一起算）`, pa: "留言（选填）" }, val: {}, p: "pre",
		b: p => {
			if (!p.p1 || !is_nbr(p.p1)) return null
			return { nbr: p.p1, aid, msg: p.pa!.trim(), sms: location.hostname === "ismist.cn" }
		},
		a: `下单失败\n无效手机号\n或今日订单已满\n或该手机号本周以达${a.ordlimw}单`,
		r: () => ordl(aidutc),
	})); else {
		t.pre.disabled = true
		t.pre.innerText = "订单已满"
	}

	for (const d of orda.ord.filter(d => d.ord).slice(0, lim_ord_a)) {
		const nbr = `${d._id.nbr.substring(0, 3)}****${d._id.nbr.substring(7)}`
		const msg = d.msg.length > 0 ? `\n\n留言：${d.msg}` : ""
		const msgs = d.msg.length > 0 ? `（${d.msg.substring(0, 5)}）` : ""
		const b = t.orda.appendChild(document.createElement("button"))
		btn(b, `${d._id.nbr.substring(7)}${msgs}`, {
			confirm: `完成订单? \n\n${nbr}\n验证码：${d.code}${msg}`,
			pos: () => pos<DocU>("put", { ordid: d._id, ord: false }),
			alert: `${nbr}\n验证码：${d.code}${msg}`,
			refresh: () => ordl(aidutc),
		})
		if (!nav.pas || !is_uid(nav.pas, { aid })) b.disabled = true
	}

	label(t.ordl, `（今日 ${n}/${a.ordlim}）`, true)
	let utrord = 0
	const lord = async () => {
		const p = t.ordl
		if (utrord < 0 || p.scrollTop > 0) return
		const h = utrord === 0 ? 0 : p.scrollHeight
		const q = await que<Q.Ord>(`ord?aid=${aid}&utc=${utrord}`)
		if (!q || q.ord.length === 0) { utrord = -1; return }
		utrord = q.ord[q.ord.length - 1]._id.utc
		const l = { ...q, anam: new Map(q.anam) }
		for (const d of l.ord) p.prepend(ord(aidutc, l, d))
		setTimeout(() => p.scrollTop = p.scrollHeight - h, 100)
	}
	lord()
	t.ordl.addEventListener("scroll", lord)
	qrcode(t, `ord${aidutc}`)

	main.append(t.bind)
}

function ord(
	aidutc: string,
	l: Ord,
	d: Ord["ord"][0],
): DocumentFragment {
	const t = bind("ord")
	const [aid, ordid] = [d._id.aid, d._id]
	const nbr = `${d._id.nbr.substring(0, 3)}****${d._id.nbr.substring(7)}`
	const msg = d.msg.length > 0 ? `\n\n留言：${d.msg}` : ""
	t.unam.innerText = `订单#${d.code}`
	t.anam.innerText = l.anam.get(aid)!
	t.anam.href = `#a${aid}`
	t.meta.innerText = utc_short(d._id.utc)
	t.msg.innerText = `${d.ord ? "准备中" : "已完成"}\n${nbr}${msg}`
	if (d.ord) [t.meta, t.msg].forEach(el => el.classList.add("pre"))
	if (nav.pas && is_uid(nav.pas, { aid })) {
		btn(t.putc, t.putc.innerText, {
			pos: () => d.ord ? pos<DocD>("put", { ordid }) : pos<DocU>("put", { ordid, ord: true }),
			confirm: "取消订单？",
			refresh: () => ordl(aidutc),
		})
		if (d.ord) btn(t.puto, t.puto.innerText, {
			pos: () => pos<DocU>("put", { ordid, ord: false }),
			refresh: () => ordl(aidutc),
		}); else t.puto.remove()
	} else t.put.remove()
	return t.bind
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
		const froze = !is_re(w) && !(nav.pas && (
			w._id.uid === nav.pas.uid
			|| is_sec(nav.pas, { aid }) || is_uid(nav.pas, { aid })
			|| is_aut(nav.pas.aut, "aut")
		))
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
			} case "live": {
				const utc = Date.now()
				t.msg.innerText = `${utc < w.utcs ? "直播预告" : utc < w.utce ? "直播中" : "直播结束"}：`
				const a = t.msg.appendChild(document.createElement("a"))
				a.innerText = w.nam
				a.href = w.src
				t.msg.append(`\n开播时间：${utc_short(w.utcs)}\n结束时间：${utc_short(w.utce)}`)
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
				const nam = {
					...w.work === "work" ? { pa: "工作日志" } : {},
					...w.work === "video" ? { p1: "视频标题：（2-256 个字符）", p2: "视频外链：（最长 128 个字符）" } : {},
					...w.work === "live" ? { p1: "直播标题：（2-256 个字符）", p2: "直播外链：（最长 128 个字符）", p3: "开播时间：（如 2023-3-26 11:30）", p4: "结束时间：" } : {},
				}
				const val = w.work === "work" ? { pa: w.msg } : w.work === "video" ? { p1: w.nam, p2: w.src } : { p1: w.nam, p2: w.src, p3: utc_short(w.utcs), p4: utc_short(w.utce) }
				const b = w.work === "work" ? (p: Put) => {
					if (!p.pa || !is_msg(p.pa)) return null
					return { workid: w._id, msg: p.pa.trim() }
				} : w.work === "video" ? (p: Put) => {
					if (!p.p1 || !p.p2 || !is_msg(p.p1) || !is_url(p.p2)) return null
					return { workid: w._id, nam: p.p1, src: p.p2 }
				} : (p: Put) => {
					const [utcs, utce] = [p.p3, p.p4].map(d => new Date(d!).getTime())
					if (!p.p1 || !p.p2 || !is_msg(p.p1) || !is_url(p.p2) || isNaN(utcs) || isNaN(utce)) return null
					return { workid: w._id, nam: p.p1, src: p.p2, utcs, utce }
				}
				const a = w.work === "work" ? "无效输入\n工作日志为 2-256 个字符" :
					w.work === "video" ? "无效输入\n视频标题为 2-256 个字符\n视频外链最长 128 个字符"
						: "无效输入\n直播标题为 2-256 个字符\n直播外链最长 128 个字符\n时间格式为 2023-3-26 11:30"
				t.put.addEventListener("click", () => put(`a${w._id.aid}`, r.anam.get(w._id.aid)!, {
					nam, val, p: "put", b, a,
					d: () => pos("put", { workid: w._id }),
					r: () => usr(w._id.uid)
				}))
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

export async function aut(
) {
	if (navhash("aut")) return
	const d = await que<Q.Aut>("aut")
	const q = { ...d, unam: new Map(d.unam) }
	const ht = (uid?: Usr["_id"][]) => uid ? uid.map(u => [`${u}`, q.unam.get(u)!] as [string, string]) : []

	navnid()
	main.innerHTML = ""
	const t = bind("aut")

	if (nav.pas && (["sup", "aud"] as const).some(a => is_aut(nav.pas!.aut, a))) {
		label(t.sup, `(${q.aut.sup?.length ?? 0}/${lim_sup}，不公示)`, true); ida(t.sup, ht(q.aut.sup))
		label(t.aud, `(${q.aut.aud?.length ?? 0}/${lim_aud}，不公示)`, true); ida(t.aud, ht(q.aut.aud))
	} else[t.sup, t.aud].forEach(el => el.parentElement?.remove())
	label(t.aut, `(${q.aut.aut?.length ?? 0}/${lim_aut})`, true); ida(t.aut, ht(q.aut.aut))
	label(t.wsl, `(${q.aut.wsl?.length ?? 0}/${lim_wsl})`, true); ida(t.wsl, ht(q.aut.wsl))
	label(t.lit, `(${q.aut.lit?.length ?? 0}/${lim_lit})`, true); ida(t.lit, ht(q.aut.lit))

	main.append(t.bind)
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

	const { marked } = await import("https://cdn.jsdelivr.net/npm/marked@latest/lib/marked.esm.js")
	const unam = new Map(q.unam)
	for (const m of q.md) {
		const t = bind("md")
		idnam(t, `${c}${m._id}`, `${m.nam}${m.pin ? "【置顶】" : ""}`)
		t.utc.innerText = utc_medium(m.utc)
		t.utcp.innerText = utc_medium(m.utcp)
		ida(t.unam, [[`${m.uid}`, unam.get(m.uid)!]])
		t.md.innerHTML = marked.parse(m.md)
		if (op === "one") t.md.classList.add("full")
		else setTimeout(() => {
			if (t.md.scrollHeight > t.md.clientHeight) {
				t.md.innerHTML += "<button>... 阅读全文</button>"
				t.md.addEventListener("click", () => t.md.classList.add("full"))
			} else t.md.classList.add("full")
		}, 50)
		if (nav.pas && m.uid === nav.pas.uid && is_aut(nav.pas.aut, c)) {
			if (!is_rej(nav.pas)) {
				t.put.addEventListener("click", () => put(
					`${c}${m._id}`, "编辑文章", {
					nam: { p1: "标题：（2-16个中文字符）", pa: "正文 Markdown" },
					val: { p1: m.nam, pa: m.md }, lim_pa: lim_md, p: "put",
					b: p => {
						if (!p.p1 || !p.pa || !is_nam(p.p1) || !is_md(p.pa)) return null
						return { [`${c}id`]: m._id, nam: p.p1, md: p.pa.trim() }
					},
					a: `无效输入\n标题为 2-16 个中文字符\n正文最长 ${lim_md} 个字符`,
					d: () => pos<DocD>("put", { [`${c}id`]: m._id }),
					r: r => r === undefined ? md(c, 0, "many") : md(c, m._id, "one"),
				}))
				btn(t.putpin, m.pin ? `取消置顶` : "置顶", {
					pos: () => pos<DocU>("put", { [`${c}id`]: m._id, pin: !m.pin }),
					refresh: () => md(c, 0, "many"),
					alert: `最多置顶 ${lim_md_pin} 篇文章`,
				})
			} else[t.put, t.putpin].forEach(el => el.disabled = true)
		} else[t.put, t.putpin].forEach(el => el.remove())
		main.append(t.bind)
	}

	if (op !== "one") setTimeout(() => {
		nav.cont = q.md.length === 0 ? null : () => md(c, q.md[q.md.length - 1]._id, "continue")
	}, 100)
}

function pre(
	nam: "用户" | "小组" | "活动",
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
		} case "小组": {
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

export type Put = { p1?: string, p2?: string, p3?: string, p4?: string, pa?: string }
export function put(
	id: string,
	nam: string,
	p: {
		nam: Put,
		val: Put,
		lim_pa?: number,
		p: Pos,
		b: (p: Put) => PosB | null,
		a: string,
		d?: () => Promise<DocD>, // deno-lint-ignore no-explicit-any
		r: (r?: any) => void,
	}
) {
	main.innerHTML = ""
	const t = bind("put")

	idnam(t, id, nam)
	if (p.nam.p1) { label(t.p1, p.nam.p1); t.p1.value = p.val.p1 ?? "" } else t.p1.parentElement!.remove()
	if (p.nam.p2) { label(t.p2, p.nam.p2); t.p2.value = p.val.p2 ?? "" } else t.p2.parentElement!.remove()
	if (p.nam.p3) { label(t.p3, p.nam.p3); t.p3.value = p.val.p3 ?? "" } else t.p3.parentElement!.remove()
	if (p.nam.p4) { label(t.p4, p.nam.p4); t.p4.value = p.val.p4 ?? "" } else t.p4.parentElement!.remove()
	if (p.lim_pa) t.pa.maxLength = p.lim_pa
	if (p.nam.pa) txt(t.pa, p.nam.pa, p.val.pa ?? ""); else t.pa.parentElement!.remove()
	if (p.d) t.putn.addEventListener("click", async () => {
		if (!confirm("确认删除？")) return
		await p.d!()
		p.r()
	}); else t.putn.remove()
	t.put.addEventListener("click", async () => {
		const b = p.b({
			...p.nam.p1 ? { p1: t.p1.value } : {},
			...p.nam.p2 ? { p2: t.p2.value } : {},
			...p.nam.p3 ? { p3: t.p3.value } : {},
			...p.nam.p4 ? { p4: t.p4.value } : {},
			...p.nam.pa ? { pa: t.pa.value } : {},
		})
		if (b === null) return alert(p.a)
		const r = await pos(p.p, b)
		if (r === null) return alert(p.a)
		setTimeout(() => p.r(r), utc_refresh)
	})
	t.cancel.addEventListener("click", () => p.r())

	main.append(t.bind)
}

function putid(
	nam: "用户" | "小组" | "活动",
	d: Usr | Soc | Agd,
) {
	if (!nav.pas) return
	navnid()
	main.innerHTML = ""
	const t = bind("putid")

	idnam(t, `${d._id}`, `编辑${nam}信息`)
	t.pnam.value = d.nam
	seladm(t, d.adm1, d.adm2)
	txt(t.intro, "简介", d.intro)

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
			t.meta.remove()
			p = () => [{ uid: d._id, ...pid(), intro: t.intro.value.trim() }]
			r = () => usr(d._id)
			break
		} case "小组": {
			[t.account, t.budget, t.fund, t.expense].forEach(el => el.parentElement?.remove())
			const s = d as Soc
			t.uidlim.value = `${s.uidlim}`
			t.reslim.value = `${s.reslim}`
			const [isaut, issec] = [is_aut(nav.pas.aut, "aut"), is_sec(nav.pas, { sid: d._id })]
			t.pnam.readOnly = t.adm1.disabled = t.adm2.disabled = t.uidlim.readOnly = !isaut
			t.intro.readOnly = t.reslim.readOnly = !issec
			p = () => [
				...isaut ? [{ sid: d._id, ...pid(), ...paut() }] : [],
				...issec ? [{ sid: d._id, ...psoc() }] : [],
			]
			r = () => soc(d._id)
			break
		} case "活动": {
			const a = d as Agd
			t.uidlim.value = `${a.uidlim}`
			t.reslim.value = `${a.reslim}`
			t.account.value = a.account
			t.budget.value = `${a.budget}`
			t.fund.value = `${a.fund}`
			t.expense.value = `${a.expense}`
			const [isaut, issec] = [is_aut(nav.pas.aut, "aut"), is_sec(nav.pas, { aid: d._id })]
			t.pnam.readOnly = t.adm1.disabled = t.adm2.disabled = t.uidlim.readOnly = !isaut;
			[t.intro, t.reslim, t.account, t.budget, t.fund, t.expense].forEach(el => el.readOnly = !issec)
			p = () => [
				...isaut ? [{ aid: d._id, ...pid(), ...paut() }] : [],
				...issec ? [{ aid: d._id, ...psoc(), ...pagd() }] : [],
			]
			r = () => agd(d._id)
			break
		}
	}
	if (nam === "用户" || !is_aut(nav.pas.aut, "aut") || is_rej(nav.pas)) t.putn.remove()
	else btn(t.putn, `删除${nam}`, {
		confirm: `确认要删除${nam}?`,
		pos: () => pos<DocD>("put", { [nam === "小组" ? "sid" : "aid"]: d._id }),
		alert: `${nam === "小组" ? "小组仍有志愿者" : "活动仍有工作日志或支持记录"}`,
		refresh: () => nam === "小组" ? id("soc") : id("agd"),
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
