// deno-lint-ignore-file no-window-prefix
import { is_nam } from "../../src/eid/is.ts";
import type { PsgRet, Pas } from "../../src/pra/pos.ts"
import { admf, agd, agr, dbt, msg, psg, soc, usr } from "./article.ts"
import { pos } from "./fetch.ts"
import { pas } from "./template.ts"

export const nav: {
	pas?: Pas | null,
} = {}
export const utc_rf = 750

export async function navpas(
	p?: Pas | null
) {
	nav.pas = p == undefined ? await pos<PsgRet["pas"]>({ psg: "pas" }) : p
	pas(nav.pas)
}

window.addEventListener("hashchange", () => {
	if (nav.pas && nav.pas.agr.length > 0) {
		return agr(nav.pas.agr[0])
	}
	const [h, s] = decodeURI(location.hash).substring(1).split("?")
	if (h == "" || h == "soc") admf()
	else if (/^\d+$/.test(h)) usr({ usr: parseInt(h) })
	else if (is_nam(h)) usr({ nam: h })
	else if (/^s\d+$/.test(h)) soc(parseInt(h.substring(1)))
	else if (/^a\d+$/.test(h)) agd(parseInt(h.substring(1)))
	else if (h.startsWith("wsl")) msg("wsl", h == "wsl" ? 0 : parseInt(h.substring(3)))
	else if (h.startsWith("lit")) msg("lit", h == "lit" ? 0 : parseInt(h.substring(3)))
	else if (h == "psg") psg()
	else if (h == "dbt") dbt(s)
	else alert(`无效 id ${h}`)
})

export function hash(
	h = ""
) {
	if (h == "" || location.hash == h) window.dispatchEvent(new Event("hashchange"))
	else location.hash = h
}

export async function load(
) {
	console.log("ismism-20231028")
	console.log(`\n主义主义开发组！成员招募中！\n\n发送自我介绍至 万大可\n`)
	await navpas()
	hash()
}
