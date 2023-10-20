// deno-lint-ignore-file no-window-prefix
import type { PsgRet, Pas } from "../../src/pra/pas.ts"
import { psg, usr } from "./article.ts"
import { pos } from "./fetch.ts"
import { pas, main } from "./template.ts"

export const nav: {
	pas?: Pas | null,
	hash: string,
} = {
	hash: "",
}

export async function navpas(
	p?: Pas | null
) {
	nav.pas = p == undefined ? await pos<PsgRet["pas"]>({ psg: "pas" }) : p
	if (nav.pas) {
		pas.innerText = nav.pas.nam
		pas.href = `#${nav.pas.usr}`
	} else {
		pas.innerText = "用户登录"
		pas.href = "#psg"
	}
}

window.addEventListener("hashchange", async () => {
	main.innerHTML = ""
	const h = nav.hash = decodeURI(location.hash).substring(1)
	if (h == "") main.append(await usr(728))
	else if (/^\d+$/.test(h)) main.append(await usr(parseInt(h)))
	else if (h == "soc") main.append(await usr(0))
	else if (/^s\d+$/.test(h)) main.append(await usr(parseInt(h.substring(1))))
	else if (h == "agd") main.append(await usr(1))
	else if (/^a\d+$/.test(h)) main.append(await usr(parseInt(h.substring(1))))
	else if (h == "psg") main.append(psg())
	else alert(`无效 id ${h}`)
})

export function hash(
	h = ""
) {
	if (h == "" || location.href == h) window.dispatchEvent(new Event("hashchange"))
	else location.href = h
}

export async function load(
) {
	console.log("ismism-20231015")
	console.log(`\n主义主义开发组！成员招募中！\n\n发送自我介绍至 万大可\n`)
	await navpas()
	hash()
}
