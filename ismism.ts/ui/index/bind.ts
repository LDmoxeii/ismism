// deno-lint-ignore-file no-window-prefix
import { Agenda, Rec } from "../../../cli/json.ts"
import { utc_medium, utc_short } from "../../src/date.ts"
import { Goal, Tag, Rec as Id } from "../../src/typ.ts"

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

function egoal(
	el: HTMLElement,
	goal: Goal[],
) {
	el.innerHTML = ""
	for (const { pct, name } of goal) {
		const [t, [p, n]] = template("goal", ["pct", "name"])
		if (pct === 100) {
			p.classList.add("done")
			p.innerText = "完成"
		} else if (pct > 0) {
			p.classList.add("ongoing")
			p.style.setProperty("--pct", `${pct}`)
			p.innerText = `${pct}%`
		}
		n.innerText = name
		el.appendChild(t)
	}
}

const roleclr = new Map([
	["发起人", "red"],
	["支持者", "purple"],
])

function eid(
	id: Id,
	uname: Map<number, string>,
	aname: Map<number, string>,
	role: string | Map<number, string>
) {
	const [t, [cinit, cuname, crole, caname, cdate, cmsg]] = template("rec",
		["initial", "uname", "role", "aname", "date", "msg"])
	const n = uname.get(id.uid)!
	cinit.innerText = n[0];
	(cinit as HTMLLinkElement).href = `#u${id.uid}`
	cuname.innerText = n;
	(cuname as HTMLLinkElement).href = `#u${id.uid}`
	const r = typeof role === "string" ? role : role.get(id.uid)!
	crole.innerText = r;
	(crole as HTMLLinkElement).href = `#u${id.uid}`
	crole.classList.add(roleclr.get(r) ?? "amber")
	caname.innerText = aname.get(id._id.aid)!;
	(caname as HTMLLinkElement).href = `#a${id._id.aid}`
	cdate.innerText = utc_short(id._id.utc)
	return { t, cmsg }
}

function ework(
	d: HTMLElement,
	work: Rec["work"],
	role: Map<number, string>,
) {
	const uname = new Map(work.uname)
	const aname = new Map(work.aname)
	for (const w of work.rec.reverse()) {
		const { t, cmsg } = eid(w, uname, aname, role)
		switch (w.op) {
			case "goal": cmsg.innerText = `${JSON.stringify(w.goal)}`; break
			case "work": cmsg.innerText = w.msg; break
			case "video": {
				cmsg.innerText = "发布了视频："
				const [t, [a]] = template("video", ["video"])
				a.innerText = w.title;
				(a as HTMLLinkElement).href = w.src
				cmsg.appendChild(t)
				break
			}
		}
		d.appendChild(t)
	}
}

function eworker(
	d: HTMLElement,
	worker: Rec["worker"],
	role: Map<number, string>,
) {
	const uname = new Map(worker.uname)
	const aname = new Map(worker.aname)
	for (const w of worker.rec.reverse()) {
		const { t, cmsg } = eid(w, uname, aname, role)
		cmsg.innerText = `作为 ${w.role} 参与工作`
		d.appendChild(t)
	}
}

function efund(
	d: HTMLElement,
	fund: Rec["fund"]
) {
	const uname = new Map(fund.uname)
	const aname = new Map(fund.aname)
	for (const f of fund.rec.reverse()) {
		const { t, cmsg } = eid(f, uname, aname, "支持者")
		cmsg.innerText = `提供支持: +${f.fund}\n${f.msg}`
		d.appendChild(t)
	}
}

function erec(
	b: [HTMLElement, HTMLElement, HTMLElement],
	d: [HTMLElement, HTMLElement, HTMLElement],
	{ work, worker, fund }: Rec
) {
	const toggle = (btn: HTMLElement, div: HTMLElement) => {
		const on = btn.classList.contains("darkgray")
		b.forEach(b => b.classList.remove("darkgray"))
		d.forEach(d => d.style.display = "none")
		if (!on) {
			btn.classList.add("darkgray")
			div.style.display = "block"
			div.scrollTop = div.scrollHeight
		}
	}
	const count = [work.rec.length, worker.rec.length, fund.rec.length]
	b.forEach((btn, n) => {
		btn.getElementsByTagName("span")[0].innerText = `${count[n]}`
		d[n].style.display = "none"
		btn.addEventListener("click", () => toggle(btn, d[n]))
	})
	const role = new Map(worker.rec.map(r => [r.uid, r.role]))
	ework(d[0], work, role)
	eworker(d[1], worker, role)
	efund(d[2], fund)
}

function eagenda(
	el: HTMLElement,
	agenda: Agenda[]
) {
	el.innerHTML = ""
	for (const {
		_id, name, tag, utc, dat, fund, budget, expense, detail, goal
	} of agenda) {
		const [t, [
			cidname, cid, cname, ctag, cdate,
			cphoto, cphoto_title, cphoto_prev, cphoto_next, cphoto_nbr, cphoto_total, cphoto_img,
			cbar, cfund, cexpense, cdetail, cgoal,
			bwork, bworker, bfund, dwork, dworker, dfund,
		]] = template("agenda", [
			"idname", "id", "name", "tag", "date",
			"photo", "photo-title", "photo-prev", "photo-next", "photo-nbr", "photo-total", "photo-img",
			"bar", "fund", "expense", "detail", "goal",
			"tab.work", "tab.worker", "tab.fund", "rec.work", "rec.worker", "rec.fund",
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

		cbar.style.setProperty("--fund", `${fund}`)
		cbar.style.setProperty("--budget", `${budget}`)
		cbar.style.setProperty("--expense", `${expense}`)
		{
			const [sfund, spct, sbudget] = [...cfund.children] as HTMLSpanElement[]
			sfund.innerText = `${fund}`
			spct.innerText = `${budget == 0 ? 0 : (fund / budget * 100).toFixed(0)}%`
			sbudget.innerText = `${budget}`
		} {
			const [sexpense, spct] = [...cexpense.children] as HTMLSpanElement[]
			sexpense.innerText = `${expense}`
			spct.innerText = `${budget == 0 ? 0 : (expense / budget * 100).toFixed(0)}%`
		}
		(cdetail as HTMLLinkElement).href = detail
		egoal(cgoal, goal)

		json(`a${_id}`).then(rec =>
			erec([bwork, bworker, bfund], [dwork, dworker, dfund], rec)
		)

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
