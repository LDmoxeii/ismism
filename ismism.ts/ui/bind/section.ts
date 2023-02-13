import type { Id } from "../../src/eid/typ.ts"
import type { Pas } from "../../src/pra/pas.ts"
import type { Usr, Soc } from "../../src/pra/que.ts"
import { utc_medium } from "../../src/ont/utc.ts"
import { adm } from "../../src/ont/adm.ts"
import { Template } from "./template.ts"
import { is_aut } from "../../src/pra/con.ts"

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

export function idanchor(
	id: number[],
	idnam: Map<Id["_id"], Id["nam"]>,
	el: HTMLElement,
	pf: "" | "s" | "a",
) {
	if (id.length === 0) { el.innerText = "无"; return }
	id.forEach(id => {
		const a = el.appendChild(document.createElement("a"))
		a.href = `#${pf}${id}`
		a.innerText = idnam.get(id) ?? `${id}`
	})
}

function idmeta(
	pas: Pas | null,
	id: Omit<NonNullable<Usr | Soc>, "unam"> & { unam: Map<Id["_id"], Id["nam"]> },
	t: Template["usr" | "soc"],
): boolean {
	let pro: null | "rej" | "ref" = null
	if (id.rej.length >= 2) pro = "rej"
	else if (id.ref.length < 2) pro = "ref"
	const pub: boolean = pro === null || (pas !== null && is_aut(pas.aut, "pro_usr"))

	if (pro === "rej") {
		t.id.classList.add("red")
		t.proc.classList.add("red")
	} else if (pro === "ref") {
		t.id.classList.add("green")
		t.proc.classList.add("green")
	} else t.proc.classList.add("gray")

	t.adm.innerText = `${id.adm1} ${id.adm2}`
	t.utc.innerText = `${utc_medium(id.utc)}`
	idanchor(id.rej, id.unam, t.rej, "")
	idanchor(id.ref, id.unam, t.ref, "")

	if (id.rej.length >= 2) {
		t.rej.classList.add("red")
		t.rejc.classList.add("red")
	} else t.rejc.classList.add("gray")
	if (id.ref.length < 2) {
		t.ref.classList.add("green")
		t.refc.classList.add("green")
	} else t.refc.classList.add("gray")

	return pub
}

export function id(
	pas: Pas | null,
	ph: "" | "s",
	id: Omit<NonNullable<Usr | Soc>, "unam"> & { unam: Map<Id["_id"], Id["nam"]> },
	t: Template["usr" | "soc"],
): boolean {
	t.idnam.href = `#${ph}${id._id}`
	t.id.innerText = `${ph}${id._id}`
	t.nam.innerText = id.nam
	return idmeta(pas, id, t) || ph === "" && pas !== null && pas.id.uid === id._id
}
