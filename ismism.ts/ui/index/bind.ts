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
	for (const { _id, name, tag, utc, dat } of agenda) {
		const [t, [
			cidname, cid, cname, ctag, cdate,
			cphoto, cphoto_title, cphoto_prev, cphoto_next, cphoto_nbr, cphoto_total, cphoto_img,
		]] = template("agenda", [
			"idname", "id", "name", "tag", "date",
			"photo", "photo-title", "photo-prev", "photo-next", "photo-nbr", "photo-total", "photo-img"
		]);

		(cidname as HTMLLinkElement).href = `#a${_id}`
		cid.innerText = `a${_id}`
		if (hash === cid.innerText) cid.classList.add("darkgray")
		else cid.classList.remove("darkgray")
		cname.innerText = name
		etag(ctag, tag)
		cdate.innerText = `公示时间: ${utc_medium(utc)}\n更新时间：${utc_medium(Date.now())}`

		if (dat === null || dat.img.length === 0)
			cphoto.parentNode?.parentNode?.removeChild(cphoto.parentNode)
		else {
			cphoto_total.innerText = `${dat.img.length}`
			let n = 0
			const nimg = (d: number) => {
				n = ((n + d) % dat.img.length + dat.img.length) % dat.img.length
				cphoto_title.innerText = dat.img[n].title
				cphoto_nbr.innerText = `${n + 1}`;
				(cphoto_img as HTMLImageElement).src = dat.img[n].src
			}
			nimg(0)
			cphoto_prev.addEventListener("click", () => nimg(-1))
			cphoto_next.addEventListener("click", () => nimg(1))
		}
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
