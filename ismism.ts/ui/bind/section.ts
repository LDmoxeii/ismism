import type { DocU } from "../../src/db.ts"
import { adm } from "../../src/ont/adm.ts"
import { utc_medium } from "../../src/ont/utc.ts"
import { Usr } from "./article.ts"
import { nav } from "./nav.ts"
import { pos, Section, utc_refresh } from "./template.ts"

export function label(
	el: HTMLElement,
	s: string,
) {
	const l = el.previousElementSibling as HTMLLabelElement
	l.innerText = s
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
	id: Usr,
	rej2: boolean,
	ref2: boolean,
) {
	t.adm.innerText = `${id.adm1} ${id.adm2}`
	t.utc.innerText = `${utc_medium(id.utc)}`
	ida(t.rej, id.rej.map(r => [`${r}`, id.unam.get(r)!]))
	ida(t.ref, id.ref.map(r => [`${r}`, id.unam.get(r)!]))
	let cls = null
	if (ref2) { cls = "green"; t.ref2.classList.add(cls) }
	if (rej2) { cls = "red"; t.rej2.classList.add(cls) }
	return cls
}

export function rolref(
	t: HTMLParagraphElement,
	u: Usr,
) {
	if (u.aut) ida(t, [[`${u._id}`, `主义主义书记 (${u.ref.length}推荐)`]], "isec")
	ida(t, u.aref.sec.map(([a, r]) => [`a${a}`, `${u.anam.get(a)}书记 (${r}推荐)`]), "sec")
	ida(t, u.sref.sec.map(([a, r]) => [`s${a}`, `${u.snam.get(a)}书记 (${r}推荐)`]), "sec")
	ida(t, u.aref.uid.map(([a, r]) => [`a${a}`, `${u.anam.get(a)}志愿者 (${r}推荐)`]), "uid")
	ida(t, u.sref.uid.map(([a, r]) => [`s${a}`, `${u.snam.get(a)}成员 (${r}推荐)`]), "uid")
	ida(t, u.aref.res.map(([a, r]) => [`a${a}`, `${u.anam.get(a)}申请人 (${r}推荐)`]), "res")
	ida(t, u.sref.res.map(([a, r]) => [`s${a}`, `${u.snam.get(a)}申请人 (${r}推荐)`]), "res")
}

export function seladm(
	t: Section["seladm"],
	adm1 = "江苏",
	adm2 = "苏州"
) {
	selopt(t.adm1, adm.keys())
	t.adm1.value = adm1
	selopt(t.adm2, adm.get(adm1)!)
	t.adm2.value = adm2
	t.adm1.addEventListener("change", () => selopt(t.adm2, adm.get(t.adm1.value)!))
}

export function pro(
	t: Section["pro"],
	id: "uid" | "sid" | "aid",
	d: Usr,
	refresh?: () => void,
) {
	if (!nav.pas) { t.pro.remove(); return }
	const [rej, ref] = [d.rej.includes(nav.pas.uid), d.ref.includes(nav.pas.uid)]
	const p = (re: "rej" | "ref", add: boolean) => pos<DocU>("pro", { re, [id]: d._id, add })
	btn(t.prorej, rej ? "取消反对" : "反对", refresh ? { pos: () => p("rej", !rej), refresh } : undefined)
	btn(t.proref, rej ? "取消推荐" : "推荐", refresh ? { pos: () => p("ref", !ref), refresh } : undefined)
}
