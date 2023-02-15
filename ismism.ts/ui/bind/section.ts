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

function selopt(
	sel: HTMLSelectElement,
	ts: Iterable<string>,
) {
	sel.options.length = 0
	for (const t of ts) {
		const opt = document.createElement("option")
		opt.text = t
		sel.add(opt)
	}
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
	t: Template["usr" | "soc" | "pre"],
	id: string,
	nam?: string,
) {
	t.idnam.href = `#${id}`
	t.id.innerText = id
	if (hash === id) t.id.classList.add("active")
	if (nam) t.nam.innerText = nam
}

export function pro(
	pas: Pas,
	t: Template["usr" | "soc"],
	id: Usr | Soc,
	re?: (r: Id["_id"]) => void,
) {
	const [prorej, proref] = [!id.rej.includes(pas.id.uid), !id.ref.includes(pas.id.uid)]
	t.prorej.innerText = prorej ? "反对" : "取消反对"
	t.proref.innerText = proref ? "推荐" : "取消推荐"
	if (re) {
		const pid = {
			...t.tid === "usr" ? { uid: id._id } : {},
			...t.tid === "soc" ? { sid: id._id } : {},
		}
		t.prorej.addEventListener("click", async () => {
			t.prorej.disabled = true
			const c = await pos<DocU>("pro", { re: "rej", ...pid, pro: prorej })
			if (c && c > 0) setTimeout(() => re(id._id), utc_refresh)
			else t.prorej.disabled = false
		})
		t.proref.addEventListener("click", async () => {
			t.proref.disabled = true
			const c = await pos<DocU>("pro", { re: "ref", ...pid, pro: proref })
			if (c && c > 0) setTimeout(() => re(id._id), utc_refresh)
			else t.proref.disabled = false
		})
	} else t.prorej.disabled = t.proref.disabled = true
}
