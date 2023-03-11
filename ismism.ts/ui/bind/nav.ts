// deno-lint-ignore-file no-window-prefix
import type { Pas } from "../../src/pra/pas.ts"
import type { NId } from "../../src/pra/que.ts"
import { adm } from "../../src/ont/adm.ts"
import { pas, soc, usr, agd, md, idn } from "./article.ts"
import { adm1, adm2, pas_a, pos, que } from "./template.ts"

export const nav: {
	pas: Pas | null,
	hash: string,
	nid: NId | null,
} = {
	pas: null,
	hash: "",
	nid: null,
}

export async function navpas(
	p?: Pas | null
) {
	nav.pas = p === undefined ? await pos<Pas>("pas", {}) : p
	if (nav.pas) {
		pas_a.innerText = nav.pas.nam
		pas_a.href = `#${nav.pas.uid}`
	} else {
		pas_a.innerText = "用户登录"
		pas_a.href = "#pas"
	}
}

function tag(
	t: HTMLMenuElement,
	h?: string,
	n?: string,
) {
	const l = t.appendChild(document.createElement("li"))
	if (h) {
		const a = l.appendChild(document.createElement("a"))
		a.href = `#${h}`
		a.addEventListener("click", () => {
			for (const e of a.parentElement!.parentElement!.children) e.classList.remove("active")
			a.parentElement!.classList.add("active")
			// if (scroll) t.scrollIntoView({ behavior: "smooth" })
		})
		if (n) a.innerText = n
	}
	return l
}

function menu(
	t: HTMLMenuElement,
	[ph, pn]: [string, string],
	hn: [string, string][],
) {
	t.innerHTML = ""
	tag(t)
	tag(t, ph, pn).classList.add("active")
	for (const [h, n] of hn) tag(t, h, n)
	tag(t)
}

export async function navnid(
	p?: "soc" | "agd",
	a1?: string,
	a2?: string,
) {
	if (!p) {
		adm1.parentElement!.classList.add("none")
		adm2.parentElement!.classList.add("none")
		return
	}
	if (!a1) {
		nav.nid = await que<NId>("nid")
		const admn = p === "soc" ? nav.nid!.adm1nsid : nav.nid!.adm1naid
		const s = admn.reduce((x, y) => x + y[1], 0)
		menu(adm1, [p, `全部 (${s})`], admn.map(([a, n]) => [`${p}${a}`, `${a} (${n})`]))
		adm1.parentElement!.classList.remove("none")
		adm2.parentElement!.classList.add("none")
	} else if (!nav.nid) return
	else if (!a2) {
		const a2 = adm.get(a1)!
		const admn = (p === "soc" ? nav.nid.adm2nsid : nav.nid.adm2naid)
			.filter(an => a2.includes(an[0]))
		const s = admn.reduce((x, y) => x + y[1], 0)
		menu(adm2, [`${p}${a1}`, `全部 (${s})`], admn.map(([a, n]) => [`${p}${a1}-${a}`, `${a} (${n})`]))
		adm1.parentElement!.classList.remove("none")
		adm2.parentElement!.classList.remove("none")
	} else {
		adm1.parentElement!.classList.remove("none")
		adm2.parentElement!.classList.remove("none")
	}
}

export function navhash(
	h: string
): boolean {
	if (nav.hash === h || nav.hash === "" && h === "agd") return false
	location.href = `#${h}`
	return true
}

window.addEventListener("hashchange", () => {
	nav.hash = decodeURI(location.hash).substring(1)
	if (nav.hash === "pas") pas()
	else if (/^\d+$/.test(nav.hash)) usr(parseInt(nav.hash))
	else if (nav.hash === "soc") soc()
	else if (nav.hash.startsWith("soc")) soc(nav.hash.substring(3))
	else if (/^s\d+$/.test(nav.hash)) soc(parseInt(nav.hash.substring(1)))
	else if (nav.hash === "" || nav.hash === "agd") agd()
	else if (nav.hash.startsWith("agd")) agd(nav.hash.substring(3))
	else if (/^a\d+$/.test(nav.hash)) agd(parseInt(nav.hash.substring(1)))
	else if (nav.hash === "wsl") md("wsl", 0, "many")
	else if (nav.hash.startsWith("wsl")) md("wsl", parseInt(nav.hash.substring(3)), "one")
	else if (nav.hash === "lit") md("lit", 0, "many")
	else if (nav.hash.startsWith("lit")) md("lit", parseInt(nav.hash.substring(3)), "one")
	else idn(nav.hash, "链接")
})

export async function load(
) {
	console.log("ismism-20230308")
	console.log(`\n主义主义开发小组！成员招募中！\n\n发送自我介绍至网站维护邮箱，或微信联系 728 万大可\n \n`)
	await navpas()
	window.dispatchEvent(new Event("hashchange"))
}
