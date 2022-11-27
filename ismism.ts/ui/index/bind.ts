// deno-lint-ignore-file no-window-prefix
import { Agenda, Rec } from "../../../cli/json.ts"
import { utc_medium } from "../../src/date.ts"
import { Tag } from "../../src/typ.ts"

let hash = ""
let agenda: Agenda[]
let recent: Rec
const tags_all: Tag[] = [
	"", "进行中", "已结束",
	"设施建设", "物资配给", "软件开发",
	"苏州", "成都",
	"工益公益", "星星家园"
]
const tags_count: number[] = []

async function json(
	name: string
) {
	const r = await fetch(`/json/${name}.json`)
	return JSON.parse(await r.text())
}

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
	agenda: Agenda[]
) {
	el.innerHTML = ""
	for (const { _id, name, tag, utc } of agenda) {
		const [t, [a, c, s, et, ed]] = template("agenda", ["idname", "id", "name", "tag", "date"]);
		(a as HTMLLinkElement).href = `#a${_id}`
		c.innerText = `a${_id}`
		if (hash === c.innerText) c.classList.add("darkgray")
		else c.classList.remove("darkgray")
		s.innerText = name
		etag(et, tag)
		ed.innerText = `公示时间: ${utc_medium(utc)}\n更新时间：${utc_medium(Date.now())}`
		el.appendChild(t)
	}
}

window.addEventListener("hashchange", () => {
	hash = decodeURI(window.location.hash).substring(1)
	etag(document.querySelector(".title div.tag")!, tags_all, tags_count)
	switch (hash[0]) {
		case "u": break
		case "s": break
		case "a": eagenda(document.getElementById("main")!, agenda.filter(a =>
			a._id === parseInt(hash.substring(1))
		)); break
		default: eagenda(document.getElementById("main")!, agenda.filter(a =>
			hash === "" || a.tag.includes(hash as Tag)
		)); break
	}
})

async function load(
) {
	[agenda, recent] = await Promise.all([
		json("agenda"), json("recent"),
	])
	console.log(`loaded ${agenda.length} agenda`)
	tags_count.push(agenda.length, ...tags_all.slice(1).map(
		t => agenda.filter(a => a.tag.includes(t)).length)
	)
	window.dispatchEvent(new Event("hashchange"))
}
load()
