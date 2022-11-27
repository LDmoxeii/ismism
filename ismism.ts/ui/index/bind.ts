// deno-lint-ignore-file no-window-prefix
import { Agenda } from "../../../cli/json.ts"
import { utc_medium, utc_short } from "../../src/date.ts"

let hash = ""

function template(
	tid: string,
	fclass: string[]
): [DocumentFragment, HTMLElement[]] {
	const temp = document.getElementById(tid) as HTMLTemplateElement
	const t = temp.content.cloneNode(true) as DocumentFragment
	return [t, fclass.map(f => t.querySelector(`.${f}`)!)]
}

function etag(
	el: HTMLElement,
	tags: string[],
	count: number[] = []
) {
	el.innerHTML = ""
	const [t, [a, n, c]] = template("tag", ["tag", "name", "count"])
	const ct = tags.length === count.length
	if (!ct) c.parentNode?.removeChild(c)
	tags.forEach((tag, i) => {
		(a as HTMLLinkElement).href = `#${tag}`
		n.innerText = tag.length === 0 ? "全部公示" : tag
		if (hash === tag) a.classList.add("darkgray")
		else a.classList.remove("darkgray")
		if (ct) c.innerText = `${count[i]}`
		el.appendChild(t.cloneNode(true))
	})
}

function eagenda(
	el: HTMLElement,
	{ _id, name }: Agenda
) {
	el.innerHTML = ""
	const [t, [a, c, s, tag, date]] = template("agenda", ["idname", "id", "name", "tag", "date"])
	c.innerText = (a as HTMLLinkElement).href = `#${_id}`
	s.innerText = name
	etag(tag, ["进行中", "然后", "1232"])
	date.innerText = `公示时间: ${utc_medium(Date.now())}\n更新时间：${utc_short(Date.now())}`
	el.appendChild(t)
}

window.addEventListener("hashchange", () => {
	hash = decodeURI(window.location.hash).substring(1)
	etag(document.querySelector(".title div.tag")!, ["", "1232", "然后"], [3, 5, 6])
	eagenda(document.getElementById("main")!, { _id: 3, name: "标题标题" } as Agenda)
})
window.dispatchEvent(new Event("hashchange"))
