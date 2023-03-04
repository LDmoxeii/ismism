// deno-lint-ignore-file no-window-prefix
import type { Pas } from "../../src/pra/pas.ts"
import { pas, soc, usr, agd, wsl, lit, idn } from "./article.ts"
import { pas_a, pos } from "./template.ts"

export const nav: {
	pas: Pas | null,
	hash: string,
} = {
	pas: null,
	hash: "",
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
	else if (/^s\d+$/.test(nav.hash)) soc(parseInt(nav.hash.substring(1)))
	else if (nav.hash === "" || nav.hash === "agd") agd()
	else if (/^a\d+$/.test(nav.hash)) agd(parseInt(nav.hash.substring(1)))
	else if (nav.hash === "wsl") wsl()
	else if (nav.hash === "lit") lit()
	else idn(nav.hash, "链接")
})

export async function load(
) {
	console.log("ismism-20230304")
	console.log(`\n主义主义开发小组！成员招募中！\n\n发送自我介绍至网站维护邮箱，或微信联系 728 万大可\n \n`)
	await navpas()
	window.dispatchEvent(new Event("hashchange"))
}
