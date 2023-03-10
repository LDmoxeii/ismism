import type { Work } from "../../src/eid/typ.ts"
import type { DocU } from "../../src/db.ts"
import type * as Q from "../../src/pra/que.ts"
import { Agd, Soc, Usr, rec as arec } from "./article.ts"
import { adm, adm1_def, adm2_def } from "../../src/ont/adm.ts"
import { utc_medium } from "../../src/ont/utc.ts"
import { nav, navpas } from "./nav.ts"
import { bind, pos, que, Section, utc_refresh } from "./template.ts"
import { is_re, is_ref, is_rej, is_sec } from "../../src/pra/con.ts"
import { is_aut, lim_re, lim_sec } from "../../src/eid/is.ts"

export function label(
	el: HTMLElement,
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
		prompt1?: string,
		prompt2?: string,
		confirm?: string,
		pos: (p1?: string, p2?: string) => T,
		alert?: string,
		refresh: (r: NonNullable<Awaited<T>>) => void,
	}
) {
	b.innerText = s
	if (c) b.addEventListener("click", async () => {
		const p1 = c.prompt1 ? prompt(c.prompt1) : undefined
		if (p1 === null) return
		const p2 = c.prompt2 ? prompt(c.prompt2) : undefined
		if (p2 === null) return
		if (!c.confirm || confirm(c.confirm)) {
			b.disabled = true
			const r = await c.pos(p1, p2)
			if (c.alert) {
				if (r === null) { alert(c.alert); b.disabled = false; return }
			} else {
				if (!r || r <= 0) return
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
	t: Section["meta"],
	id: Usr | Soc,
) {
	t.adm.innerText = `${id.adm1} ${id.adm2}`
	t.utc.innerText = `${utc_medium(id.utc)}`
	ida(t.rej, id.rej.map(r => [`${r}`, id.unam.get(r)!]))
	ida(t.ref, id.ref.map(r => [`${r}`, id.unam.get(r)!]))
	let cls = null
	if (!is_ref(id)) { cls = "green"; t.ref2.classList.add(cls) }
	if (is_rej(id)) { cls = "red"; t.rej2.classList.add(cls) }
	return cls
}

export function rolref(
	t: HTMLParagraphElement,
	u: Usr,
) {
	if (is_aut(u.aut, "aut")) ida(t, [[`${u._id}`, `管理员 (${u.ref.length}推荐)`]], "isec")
	ida(t, u.aref.sec.map(([a, r]) => [`a${a}`, `${u.anam.get(a)}联络员 (${r}推荐)`]), "sec")
	ida(t, u.sref.sec.map(([a, r]) => [`s${a}`, `${u.snam.get(a)}联络员 (${r}推荐)`]), "sec")
	ida(t, u.aref.uid.map(([a, r]) => [`a${a}`, `${u.anam.get(a)}志愿者 (${r}推荐)`]), "uid")
	ida(t, u.sref.uid.map(([a, r]) => [`s${a}`, `${u.snam.get(a)}志愿者 (${r}推荐)`]), "uid")
	ida(t, u.aref.res.map(([a, r]) => [`a${a}`, `${u.anam.get(a)}申请人 (${r}推荐)`]), "res")
	ida(t, u.sref.res.map(([a, r]) => [`s${a}`, `${u.snam.get(a)}申请人 (${r}推荐)`]), "res")
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

export function rec(
	t: Section["rec"],
	id: "uid" | "sid" | "aid",
	d: Usr | Soc | Agd,
	froze: boolean,
) {
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
	if (d.ref.includes(nav.pas.uid)) btn(t.putsec, t.putsec.innerText, {
		prompt1: "输入要增加或删除的联络员名",
		pos: p1 => {
			const uid = namid.get(p1 ?? "")
			if (!uid) return null
			return pos<DocU>("put", { [id]: d._id, rol: "sec", uid, add: !d.sec.includes(uid) })
		},
		alert: `无效联络员名或联络员已满\n增删的联络员需先作为申请人或其它出现在${id === "sid" ? "社团" : "活动"}名单`,
		refresh: async () => { await navpas(); refresh() },
	}); else t.putsec.remove() // deno-lint-ignore no-explicit-any
	if (is_sec(nav.pas, { [id]: d._id } as any)) btn(t.putuid, t.putuid.innerText, {
		prompt1: "输入要增加或删除的志愿者名",
		pos: p1 => {
			const uid = namid.get(p1 ?? "")
			if (!uid) return null
			return pos<DocU>("put", { [id]: d._id, rol: "uid", uid, add: !d.uid.includes(uid) })
		},
		alert: `无效志愿者名或志愿者已满\n增删的志愿者需先作为申请人或志愿者出现在${id === "sid" ? "社团" : "活动"}名单`,
		refresh: async () => { await navpas(); refresh() },
	}); else t.putuid.remove()
	const [isuid, isres] = [d.uid.includes(nav.pas.uid), d.res.includes(nav.pas.uid)]
	if (!isuid && is_re(d) || isres) btn(t.putres, isres ? "取消申请" : "申请加入", !isres && d.res.length >= d.reslim ? undefined : {
		pos: () => pos<DocU>("put", { [id]: d._id, rol: "res", uid: nav.pas!.uid, add: !isres }),
		refresh,
		alert: "申请人已满",
	}); else t.putres.disabled = true
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
