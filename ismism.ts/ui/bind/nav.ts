// deno-lint-ignore-file no-window-prefix
import { Pas } from "../../src/pra/pas.ts"
import { pasact, soc, usr, agd, idnull } from "./article.ts"
import { pas_a, pos } from "./template.ts"

export let pas: Pas | null = null
export let hash = ""

export async function paschange(
	p?: Pas | null
) {
	pas = p === undefined ? await pos<Pas>("pas", {}) : p
	if (pas) {
		pas_a.innerText = pas.nam
		pas_a.href = `#${pas.id.uid}`
	} else {
		pas_a.innerText = "用户登录"
		pas_a.href = "#pas"
	}
}

export function hashchange(
	h: string
): boolean {
	if (hash === h || hash === "" && h === "agd") return false
	location.href = `#${h}`
	return true
}

window.addEventListener("hashchange", () => {
	hash = decodeURI(location.hash).substring(1)
	if (hash === "pas") pasact()
	else if (/^\d+$/.test(hash)) usr(parseInt(hash))
	else if (hash === "soc") soc()
	else if (/^s\d+$/.test(hash)) soc(parseInt(hash.substring(1)))
	else if (hash === "" || hash === "agd") agd()
	else if (/^a\d+$/.test(hash)) agd(parseInt(hash.substring(1)))
	else idnull(hash, "链接")
})

export async function load(
) {
	console.log("ismism-20230204")
	console.log(`\n主义主义开发小组！成员招募中！\n\n发送自我介绍至网站维护邮箱，或微信联系 728 万大可\n \n`)
	await paschange()
	window.dispatchEvent(new Event("hashchange"))
}
