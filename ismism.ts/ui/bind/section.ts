import type { Aut, Id } from "../../src/eid/typ.ts"
import type { Pas } from "../../src/pra/pas.ts"
import { utc_medium } from "../../src/ont/utc.ts"
import { adm } from "../../src/ont/adm.ts"
import { pos, Template, utc_refresh } from "./template.ts"
import { is_aut } from "../../src/pra/con.ts"
import { Usr, Soc, hash } from "./article.ts"
import type { DocU } from "../../src/db.ts"

export function label(
	el: HTMLElement,
	s: string,
) {
	const l = el.previousElementSibling as HTMLLabelElement
	l.innerText = s
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
				if (!r || r <= 0) return
			}
			if (r || r === 0) setTimeout(() => c.refresh(r), utc_refresh)
		}
	}); else b.disabled = true
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

export function admsel(
	t: Template["pasact" | "pre" | "putusr"],
	adm1 = "江苏",
	adm2 = "苏州"
) {
	selopt(t.adm1, adm.keys())
	t.adm1.value = adm1
	selopt(t.adm2, adm.get(adm1)!)
	t.adm2.value = adm2
	t.adm1.addEventListener("change", () => selopt(t.adm2, adm.get(t.adm1.value)!))
}

export function ida(
	t: HTMLElement,
	pf: "" | "s" | "a",
	nam: Map<Id["_id"], Id["nam"]>,
	id?: number[],
) {
	if (!id) id = [...nam.keys()]
	if (id.length === 0) return
	id.forEach(id => {
		const a = t.appendChild(document.createElement("a"))
		a.href = `#${pf}${id}`
		a.innerText = nam.get(id) ?? `${pf}${id}`
	})
}

export function idmeta(
	pas: Pas | null,
	t: Template["usr" | "soc"],
	id: Usr | Soc,
): boolean {
	const [rej, ref] = [id.rej.length >= 2, id.ref.length < 2]
	const re: "rej" | "ref" | null = rej ? "rej" : ref ? "ref" : null
	const { aut }: { aut?: Aut["aut"][0] } = {
		...t.tid === "usr" ? { aut: "pre_usr" } : {},
		...t.tid === "soc" ? { aut: "pre_soc" } : {},
	}
	const pub: boolean = re === null || (pas !== null && aut !== undefined && is_aut(pas.aut, aut))

	t.adm.innerText = `${id.adm1} ${id.adm2}`
	t.utc.innerText = `${utc_medium(id.utc)}`
	ida(t.rej, "", id.unam, id.rej)
	ida(t.ref, "", id.unam, id.ref)

	if (rej) [t.rej, t.rejc].forEach(el => el.classList.add("red"))
	if (ref) [t.ref, t.refc].forEach(el => el.classList.add("green"))
	if (re === "rej") [t.id, t.proc].forEach(el => el.classList.add("red"))
	else if (re === "ref") [t.id, t.proc].forEach(el => el.classList.add("green"))

	return pub
}

export function idnam(
	t: Template["usr" | "soc" | "pre" | "putusr"],
	id: string,
	nam?: string,
) {
	t.idnam.href = `#${id}`
	t.id.innerText = id
	if (hash === id) t.id.classList.add("active")
	if (nam) {
		if ("value" in t.nam) t.nam.value = nam
		else t.nam.innerText = nam
	}
}

export function pro(
	pas: Pas,
	t: Template["usr" | "soc"],
	id: Usr | Soc,
	refresh?: () => void,
) {
	const [rej, ref] = [!id.rej.includes(pas.id.uid), !id.ref.includes(pas.id.uid)]
	const p = (r: "rej" | "ref", p: boolean) => pos<DocU>("pro", {
		re: r, pro: p,
		...t.tid === "usr" ? { uid: id._id } : {},
		...t.tid === "soc" ? { sid: id._id } : {},
	})
	btn(t.prorej, rej ? "反对" : "取消反对", refresh ? { pos: () => p("rej", rej), refresh } : undefined)
	btn(t.proref, ref ? "推荐" : "取消推荐", refresh ? { pos: () => p("ref", ref), refresh } : undefined)
}
