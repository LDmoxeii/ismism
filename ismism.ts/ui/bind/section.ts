import type { Md, Work } from "../../src/eid/typ.ts"
import type { DocC, DocD, DocU } from "../../src/db.ts"
import type * as Q from "../../src/pra/que.ts"
import { Agd, Soc, Usr, rec as arec, md, put, aut } from "./article.ts"
import { adm, adm1_def, adm2_def } from "../../src/ont/adm.ts"
import { utc_d, utc_date, utc_medium } from "../../src/ont/utc.ts"
import { nav, navpas } from "./nav.ts"
import { bind, pos, que, Section, utc_refresh } from "./template.ts"
import { is_ref, is_rej, is_sec } from "../../src/pra/can.ts"
import { is_aut, is_id, is_md, is_nam, lim_nrecday, lim_md, lim_re, lim_sec } from "../../src/eid/is.ts"
import { qrcode as qr } from "https://deno.land/x/qrcode@v2.0.0/mod.ts"

export function label(
	el: HTMLElement | SVGSVGElement,
	s: string,
	append = false
) {
	const l = el.previousElementSibling as HTMLLabelElement
	if (append) l.innerText += s
	else l.innerText = s
}

export function txt(
	t: HTMLTextAreaElement,
	n: string,
	s?: string,
) {
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

export function ida(
	t: HTMLElement,
	ht: [string, string][],
	cls?: string | null,
) {
	ht.forEach(([h, n]) => {
		const a = t.appendChild(document.createElement("a"))
		a.href = `#${h}`
		a.innerText = n
		if (cls) a.classList.add(cls)
	})
}

export function btn<
	T
>(
	b: HTMLButtonElement,
	s: string,
	c?: {
		confirm?: string,
		pos: () => T,
		alert?: string,
		refresh: (r: NonNullable<Awaited<T>>) => void,
	}
) {
	b.innerText = s
	if (c) b.addEventListener("click", async () => {
		if (!c.confirm || confirm(c.confirm)) {
			b.disabled = true
			const r = await c.pos()
			if (c.alert) {
				if (r === null) { alert(c.alert); b.disabled = false; return }
			} else {
				if (!r || typeof r === "number" && r <= 0) return
			}
			if (r || r === 0) setTimeout(() => c.refresh(r), utc_refresh)
		}
	}); else b.disabled = true
}

export function idnam(
	t: Section["idnam"],
	id: string,
	nam?: string,
	cls?: string | null,
) {
	t.idnam.href = `#${id}`
	t.id.innerText = id
	if (nav.hash === id) t.id.classList.add("active")
	if (nam) t.nam.innerText = nam
	if (cls) t.id.classList.add(cls)
}

export function meta(
	t: Section["meta_usr" | "meta_id"],
	id: Usr | Soc | Agd,
	ua?: Usr["aut"],
) {
	t.adm.innerText = `${id.adm1} ${id.adm2}`
	t.utc.innerText = utc_medium(id.utc)

	if (ua) {
		if (ua.length > 0) ida(t.ref, [["aut", "本平台管理团队"]])
		if ("rej" in t) ida(t.rej, id.rej.map(r => [`${r}`, id.unam.get(r)!]))
		ida(t.ref, id.ref.map(r => [`${r}`, id.unam.get(r)!]))
	} else if (id.ref.length > 0) ida(t.ref, [["aut", "本平台管理团队"]])

	const rej = ua && is_rej(id) || !ua && id.rej.length > 0
	const ref = ua && ua.length === 0 && !is_ref(id) || !ua && id.ref.length === 0
	let cls = null
	if (ref) cls = "green"
	if (rej) {
		cls = "red"
		if ("rej2" in t) t.rej2.classList.add(cls)
	}
	return cls
}

export function rolref(
	t: HTMLParagraphElement,
	u: Usr,
) {
	if (nav.pas && u._id === nav.pas.uid) {
		if (is_aut(nav.pas.aut, "sup")) ida(t, [["aut", `超级管理员 (不公示)`]], "isec")
		if (is_aut(nav.pas.aut, "aud")) ida(t, [["aut", `审计员 (不公示)`]], "isec")
	}
	if (is_aut(u.aut, "aut")) ida(t, [["aut", `本平台管理团队`]], "isec")
	if (is_aut(u.aut, "wsl")) ida(t, [["aut", `法律援助编辑`]], "sec")
	if (is_aut(u.aut, "lit")) ida(t, [["aut", `理论学习编辑`]], "sec")
	ida(t, u.arol.sec.map(id => [`a${id}`, `${u.anam.get(id)}联络员`]), "sec")
	ida(t, u.srol.sec.map(id => [`s${id}`, `${u.snam.get(id)}联络员`]), "sec")
	ida(t, u.arol.uid.map(id => [`a${id}`, `${u.anam.get(id)}志愿者`]), "uid")
	ida(t, u.srol.uid.map(id => [`s${id}`, `${u.snam.get(id)}志愿者`]), "uid")
	ida(t, u.arol.res.map(id => [`a${id}`, `${u.anam.get(id)}申请人`]), "res")
	ida(t, u.srol.res.map(id => [`s${id}`, `${u.snam.get(id)}申请人`]), "res")
}

export function re(
	t: Section["re"],
	u: Usr,
) {
	label(t.urej, `（${u.urej.length}/${lim_re}）`, true)
	ida(t.urej, u.urej.map(r => [`${r}`, u.unam.get(r)!]))
	label(t.uref, `（${u.uref.length}/${lim_re}）`, true)
	ida(t.uref, u.uref.map(r => [`${r}`, u.unam.get(r)!]))
}

export function rel(
	t: Section["rel"],
	d: Soc | Agd,
) {
	label(t.sec, `（${d.sec.length}/${lim_sec}）`, true)
	ida(t.sec, d.sec.map(r => [`${r}`, d.unam.get(r)!]))
	label(t.uid, `（${d.uid.length}/${d.uidlim}）`, true)
	ida(t.uid, d.uid.map(r => [`${r}`, d.unam.get(r)!]))
	label(t.res, `（${d.res.length}/${d.reslim}）`, true)
	ida(t.res, d.res.map(r => [`${r}`, d.unam.get(r)!]))
}

export function cover(
	t: Section["cover"],
	a: Agd,
) {
	if (a.img.length === 0) { t.cover.remove(); return }
	let n = 0
	const img = (d: number) => {
		n = ((n + d) % a.img.length + a.img.length) % a.img.length;
		t.imgn.innerText = `第 ${n + 1} / ${a.img.length} 张`
		t.imgnam.innerText = a.img[n].nam
		t.img.src = a.img[n].src
	}
	t.prev.addEventListener("click", () => img(-1))
	t.next.addEventListener("click", () => img(+1))
	img(0)
}

export function acct(
	t: Section["acct"],
	a: Agd,
) {
	if (a.budget > 0) {
		t.fund.textContent = `${a.fund}`
		t.budget.textContent = `${a.budget}`
		t.expense.textContent = `${a.expense}`
		const [fpct, epct] = [a.fund / a.budget, a.expense / a.budget].map(p => `${Math.round(p * 100)}%`)
		t.fundbar.style.width = t.fundpct.textContent = fpct
		t.expensebar.style.width = t.expensepct.textContent = epct
	}
	if (a.account.length > 0) t.account.href = a.account
	else t.account.classList.add("none")
}

export function goal(
	t: HTMLParagraphElement,
	a: Agd,
) {
	for (const { nam, pct } of a.goal.sort((m, n) => m.pct - n.pct)) {
		const g = bind("goal")
		g.nam.innerText = nam
		if (pct === 0 || pct >= 100) g.pct.classList.add("gray")
		if (pct >= 100) {
			g.pct.textContent = "完成"
			g.circle.remove()
		} else {
			g.pct.textContent = `${pct}%`
			g.circle.style.setProperty("--pct", `${pct}`)
		}
		t.append(g.bind)
	}
}

export function seladm(
	t: Section["seladm"],
	adm1 = adm1_def,
	adm2 = adm2_def,
) {
	selopt(t.adm1, adm.keys())
	t.adm1.value = adm1
	selopt(t.adm2, adm.get(adm1)!)
	t.adm2.value = adm2
	t.adm1.addEventListener("change", () => selopt(t.adm2, adm.get(t.adm1.value)!))
}

export async function qrcode(
	s: Section["qrcode"],
	h: string,
) { // deno-lint-ignore no-explicit-any
	s.qrcode.src = await qr(`https://${location.hostname}#${h}`) as any as string
}

function nrecday(
	s: Section["rec"],
	d: Usr | Soc | Agd,
) {
	const svg = bind("nrecday").nrecday
	const r = svg.getElementsByTagName("rect")
	const date = new Date(utc_date(Date.now() - lim_nrecday * utc_d, true))
	const day = (date.getDay() + 6) % 7
	const t = date.getTime()
	for (let n = 0; n <= lim_nrecday; ++n) r[day + n].classList.add("day")
	let nrec = 0
	d.nrecd90.forEach(([td, nr]) => {
		if (td < t) return
		nrec += nr
		const n = Math.floor((td - t) / utc_d)
		r[day + n].classList.add(nr <= 4 ? "lo" : nr <= 8 ? "mi" : "hi")
	})
	const dwork = s.recwork.parentElement as HTMLDetailsElement
	svg.addEventListener("click", () => dwork.open = !dwork.open)
	s.nrecday.append(svg)
	label(svg, `（最近${lim_nrecday}天有${nrec}条工作日志）`, true)
}

export function rec(
	t: Section["rec"],
	id: "uid" | "sid" | "aid",
	d: Usr | Soc | Agd,
	froze: boolean,
) {
	nrecday(t, d)
	label(t.recwork, `（${d.nrec.work}）`, true)
	label(t.recfund, `（${d.nrec.fund}）`, true)
	if (froze) { [t.recwork, t.recfund].forEach(el => el.classList.add("froze")); return }
	const utc = { work: d.nrec.work > 0 ? 0 : -1, fund: d.nrec.fund > 0 ? 0 : -1 }
	const lrec = async (c: "work" | "fund") => {
		const p = t[`rec${c}`]
		if (utc[c] < 0 || p.scrollTop > 0) return
		const h = utc[c] === 0 ? 0 : p.scrollHeight
		const rec = await que<Q.Rec>(`rec?c=${c}&${id}=${d._id}&utc=${utc[c]}`)
		if (!rec || rec.rec.length === 0) { utc[c] = -1; return }
		utc[c] = rec.rec[rec.rec.length - 1]._id.utc
		const rc = { ...rec, unam: new Map(rec.unam), anam: new Map(rec.anam) }
		for (const r of rc.rec) p.prepend(arec(c, rc, r))
		setTimeout(() => p.scrollTop = p.scrollHeight - h, 100)
	}
	t.recwork.addEventListener("scroll", () => lrec("work"))
	t.recfund.addEventListener("scroll", () => lrec("fund"))
	const [dwork, dfund] = [t.recwork, t.recfund].map(r => r.parentElement as HTMLDetailsElement)
	dwork.addEventListener("toggle", async () => {
		if (!dwork.open) return
		if (utc.work === 0) await lrec("work")
		dwork.scrollIntoView(false)
	})
	dfund.addEventListener("toggle", async () => {
		if (!dfund.open) return
		if (utc.fund === 0) await lrec("fund")
		dfund.scrollIntoView(false)
	})
}

export function putrel(
	t: Section["putrel"],
	id: "sid" | "aid",
	d: Soc | Agd,
	refresh: () => void,
) {
	if (!nav.pas) { t.putrel.remove(); return }
	const namid = new Map([...d.unam.entries()].map(([u, nam]) => [nam, u]))
	if (is_aut(nav.pas.aut, "aut")) t.putsec.addEventListener("click", () => put(
		`${id === "sid" ? "s" : "a"}${d._id}`, t.putsec.innerText, {
		nam: { p1: "用户名：（留空以将所有申请人添加为联络员）" }, val: {}, p: "put",
		b: p => {
			if (p.p1 === "") return { [id]: d._id, rol: "sec", add: true }
			const uid = namid.get(p.p1 ?? "")
			return uid ? { [id]: d._id, rol: "sec", uid, add: !d.sec.includes(uid) } : null
		},
		a: `无效用户名或联络员已满\n增删的联络员需先作为申请人或其它出现在${id === "sid" ? "小组" : "活动"}名单`,
		r: refresh,
	})); else t.putsec.remove() // deno-lint-ignore no-explicit-any
	if (is_sec(nav.pas, { [id]: d._id } as any)) t.putuid.addEventListener("click", () => put(
		`${id === "sid" ? "s" : "a"}${d._id}`, t.putuid.innerText, {
		nam: { p1: "用户名：（留空以将所有申请人添加为志愿者）" }, val: {}, p: "put",
		b: p => {
			if (p.p1 === "") return { [id]: d._id, rol: "uid", add: true }
			const uid = namid.get(p.p1 ?? "")
			return uid ? { [id]: d._id, rol: "uid", uid, add: !d.uid.includes(uid) } : null
		},
		a: `无效志愿者名或志愿者已满\n增删的志愿者需先作为申请人或志愿者出现在${id === "sid" ? "小组" : "活动"}名单`,
		r: refresh,
	})); else t.putuid.remove() // deno-lint-ignore no-explicit-any
	if (is_aut(nav.pas.aut, "aut") || is_sec(nav.pas, { [id]: d._id } as any)) btn(t.putresn, t.putresn.innerText, d.res.length > 0 ? {
		confirm: "清空申请人名单？",
		pos: () => pos<DocU>("put", { [id]: d._id, rol: "res" }),
		refresh,
	} : undefined); else t.putresn.remove()
	const [isuid, isres] = [d.uid.includes(nav.pas.uid), d.res.includes(nav.pas.uid)]
	if (!isuid && d.rej.length === 0 && d.ref.length > 0 || isres) btn(t.putres, isres ? "取消申请" : "申请加入", !isres && d.res.length >= d.reslim ? undefined : {
		pos: () => pos<DocU>("put", { [id]: d._id, rol: "res", uid: nav.pas!.uid, add: !isres }),
		refresh,
		alert: "申请人已满",
	}); else t.putres.disabled = true
}

export function wsllit(
	t: Section["wsllit"],
) {
	if (!nav.pas) { t.wsllit.remove(); return }
	if (is_aut(nav.pas.aut, "sup")) {
		for (const c of ["wsl", "lit"] as const) {
			const el = t[`pre${c}a`]
			el.addEventListener("click", () => put(`${nav.pas!.uid}`, el.innerText, {
				nam: { p1: "用户名：" }, val: {}, p: "pre",
				b: p => p.p1 && is_nam(p.p1) ? { nam: p.p1, aut: c } : null,
				a: "无效用户名，或已达上限",
				r: async () => { await navpas(); aut() },
			}))
		}
	} else[t.prewsla, t.prelita].forEach(el => el.remove())
	for (const c of ["wsl", "lit"] as const) {
		const el = t[`pre${c}`]
		if (is_aut(nav.pas.aut, c)) {
			if (!is_rej(nav.pas)) el.addEventListener("click", async () => {
				const id = await pos<DocC<Md["_id"]>>("pre", { [`${c}nam`]: "新建文章" })
				if (id && is_id(id)) put(`${c}${id}`, el.innerText, {
					nam: { p1: "标题：（2-16个中文字符）", pa: "正文 Markdown" }, val: {}, lim_pa: lim_md, p: "put",
					b: p => {
						if (!p.p1 || !p.pa || !is_nam(p.p1) || !is_md(p.pa)) return null
						return { [`${c}id`]: id, nam: p.p1, md: p.pa.trim() }
					},
					a: `无效输入\n标题为 2-16 个中文字符\n正文最长 ${lim_md} 个字符`,
					d: () => pos<DocD>("put", { [`${c}id`]: id }),
					r: r => r === undefined ? md(c, 0, "many") : md(c, id, "one"),
				})
			}); else el.disabled = true
		} else el.remove()
	}
}

export function putpro(
	t: Section["putpro"],
	id: "uid" | "sid" | "aid" | "workid",
	d: Usr | Soc | Agd | Work,
	refresh?: () => void,
) {
	if (!nav.pas) { t.putpro.remove(); return }
	const repas = id === "sid" || id !== "aid"
	const [rej, ref] = [d.rej.includes(nav.pas.uid), d.ref.includes(nav.pas.uid)]
	const p = (re: "rej" | "ref", add: boolean) => pos<DocU>("pro", { re, [id]: d._id, add })
	btn(t.putrej, rej ? "取消反对" : "反对", refresh ? {
		pos: () => p("rej", !rej),
		refresh
	} : undefined)
	btn(t.putref, ref ? "取消推荐" : "推荐", refresh ? {
		pos: () => p("ref", !ref),
		refresh: async () => { if (repas) await navpas(); refresh() },
	} : undefined)
}
