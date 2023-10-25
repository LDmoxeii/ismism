// deno-lint-ignore-file no-window-prefix
import type { PsgRet, Pas } from "../../src/pra/pos.ts"
import { admf, psg, soc, usr } from "./article.ts"
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
	const h = decodeURI(location.hash).substring(1)
	if (h == "" || h == "soc") admf()
	else if (/^\d+$/.test(h)) usr({ usr: parseInt(h) })
	else if (/^s\d+$/.test(h)) soc(parseInt(h.substring(1)))
	else if (/^a\d+$/.test(h)) usr({ usr: parseInt(h.substring(1)) })
	else if (h == "psg") psg()
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
	console.log("ismism-20231015")
	console.log(`\n主义主义开发组！成员招募中！\n\n发送自我介绍至 万大可\n`)
	await navpas()
	hash()
}
