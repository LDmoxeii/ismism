// deno-lint-ignore-file no-window-prefix
import { usr } from "./article.ts"
import { main } from "./template.ts"

export const nav: {
	hash: string,
} = {
	hash: "",
}

window.addEventListener("hashchange", () => {
	main.innerHTML = ""
	const h = nav.hash = decodeURI(location.hash).substring(1)
	if (h == "") main.append(usr(728))
	else if (/^\d+$/.test(h)) main.append(usr(parseInt(h)))
	else if (h == "soc") main.append(usr(0))
	else if (/^s\d+$/.test(h)) main.append(usr(parseInt(h.substring(1))))
	else if (h == "agd") main.append(usr(1))
	else if (/^a\d+$/.test(h)) main.append(usr(parseInt(h.substring(1))))
	else alert(`无效 id ${h}`)
})


export function load(
) {
	console.log("ismism-20231015")
	console.log(`\n主义主义开发组！成员招募中！\n\n发送自我介绍至 万大可\n \n`)
	window.dispatchEvent(new Event("hashchange"))
}
