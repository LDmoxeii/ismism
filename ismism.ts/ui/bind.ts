// deno-lint-ignore-file no-window-prefix
import { Agenda, Recent, Rec } from "../../cli/json.ts"
import { } from "../src/typ.ts"

async function json(
	name: string
) {
	const r = await fetch(`/json/${name}.json`)
	return JSON.parse(await r.text())
}

let hash = ""
let agenda: Agenda[]
let recent: Recent

function from_utc(
	utc: number
) {
	return new Date(utc).toLocaleString("zh-CN", { dateStyle: "medium", timeStyle: "short" })
}
// function etag(
// 	el: HTMLElement,
// 	tags: string[],
// 	ct = false
// ) {
// 	el.innerHTML = ""
// 	const item = (document.getElementById("tag-item") as HTMLTemplateElement).content.children
// 	for (const t of tags) {
// 		const a = el.appendChild(item[t == hash ? 1 : 0].cloneNode(true)) as HTMLLinkElement
// 		const s = a.getElementsByTagName("span")
// 		a.href = `#${t}`
// 		s[0].innerText = t.length == 0 ? "全部公示" : t
// 		if (ct) s[1].innerText = agenda.filter(p => t.length == 0 || p.tag.includes(t)).length
// 		else s[1].style.display = "none"
// 	}
// }

function etitle(
	el: HTMLElement,
	{ _id, name, utc }: Agenda,
) {
	const a = el.getElementsByTagName("a")[0]
	a.href = `#${_id}`
	a.getElementsByTagName("code")[0].innerText = `#${_id}`
	a.getElementsByTagName("span")[0].innerText = name
	a.classList.add("title")
	//etag(el.getElementsByClassName("tag")[0], tag)
	const d = el.getElementsByClassName("date")[0].getElementsByTagName("span")
	const t = from_utc(utc)
	d[0].innerText = t
	d[1].innerText = t
}

function eimg(
	el: HTMLElement,
	{ dat }: Agenda
) {
	if (dat === null || dat.img.length === 0) {
		el.style.display = "none"
		return
	}
	const s = el.getElementsByTagName("div")[0].children
	const img = el.getElementsByTagName("img")[0]
	let nimg = 0
	const uimg = (dn: number) => {
		nimg = ((nimg + dn) % dat.img.length + dat.img.length) % dat.img.length
		img.alt = (s[0] as HTMLElement).innerText = dat.img[nimg].title;
		(s[2].children[0] as HTMLElement).innerText = `${nimg + 1}`;
		(s[2].children[1] as HTMLElement).innerText = `${dat.img.length}`
		img.src = dat.img[nimg].src
	}
	uimg(0)
	s[1].children[0].addEventListener("click", () => uimg(-1))
	s[1].children[1].addEventListener("click", () => uimg(+1))
}

function estat(
	el: HTMLElement,
	a: Agenda
) {
	el.style.setProperty("--fund", `${a.fund}`)
	el.style.setProperty("--budget", `${a.budget}`)
	el.style.setProperty("--expense", `${a.expense}`)
	const fund = el.getElementsByClassName("fund")[0].children;
	(fund[0] as HTMLElement).innerText = a.fund.toString();
	(fund[1] as HTMLElement).innerText = `${a.budget == 0 ? 0 : (a.fund / a.budget * 100).toFixed(0)}%`;
	(fund[2] as HTMLElement).innerText = a.budget.toString()
	const expense = el.getElementsByClassName("expense")[0].children;
	(expense[0] as HTMLElement).innerText = a.expense.toString();
	(expense[1] as HTMLElement).innerText = `${a.budget == 0 ? 0 : (a.expense / a.budget * 100).toFixed(0)}%`
	el.getElementsByTagName("a")[0].href = a.detail
	const tg = (document.getElementById("circle-item") as HTMLTemplateElement).content.children
	const circle = el.getElementsByClassName("circle")[0]
	for (const { name, pct } of a.goal) {
		const c = circle.appendChild(tg[pct == 0 ? 0 : (pct < 100 ? 1 : 2)].cloneNode(true)) as HTMLElement;
		(c.children[0] as HTMLElement).style.setProperty("--pct", `${pct}`);
		(c.children[0] as HTMLElement).innerText = pct >= 100 ? "完成" : `${pct}%`;
		(c.children[1] as HTMLElement).innerText = name
	}
}

// const cbadge = new Map([
// 	["发起人", "red"],
// 	["参与者", "amber"],
// 	["支持者", "purple"],
// 	["工益公益", "black"],
// 	["星星家园", "black"],
// 	["主义主义网站", "black"],
// ]);

// function ebadge(
// 	el, badge
// ) {
// 	el.innerHTML = ""
// 	const t = document.getElementById("badge-item").content.children[0]
// 	for (const b of badge) {
// 		const s = el.appendChild(t.cloneNode(true))
// 		const c = cbadge.get(b)
// 		if (c) s.classList.add(c)
// 		s.innerText = b
// 	}
// }

function elog_worker(
	el: HTMLElement,
	worker: Rec["worker"]
) {
	const uname = new Map(worker.uname)
	const aname = new Map(worker.aname)
	el.innerHTML = ""
	const tl = (document.getElementById("log-item") as HTMLTemplateElement).content.children
	const head = el.appendChild(tl[0].cloneNode(true)) as HTMLElement
	head.innerText = `${worker.rec.length} 名参与者`
	for (const w of worker.rec) {
		const d = (el.appendChild(tl[1].cloneNode(true)) as HTMLElement).children;
		const name = uname.get(w.uid)!;
		(d[0] as HTMLElement).innerText = name[0];
		((d[1] as HTMLElement).children[0].children[0] as HTMLElement).innerText = name;
		//ebadge(d[1].children[0].children[1], m.badge)
		(d[1].children[1] as HTMLElement).innerText = from_utc(w._id.utc);
		(d[1].children[2] as HTMLElement).innerText = `作为 ${w.role} 参与 ${aname.get(w._id.aid)}`
	}
	const foot = el.appendChild(tl[0].cloneNode(true)) as HTMLElement
	foot.innerText = head.innerText
}
function elog_work(
	el: HTMLElement,
	work: Rec["work"]
) {
	const uname = new Map(work.uname)
	const aname = new Map(work.aname)
	el.innerHTML = ""
	const tl = (document.getElementById("log-item") as HTMLTemplateElement).content.children
	const tv = (document.getElementById("video-link") as HTMLTemplateElement).content.children[0] as HTMLElement
	const head = el.appendChild(tl[0].cloneNode(true)) as HTMLElement
	head.innerText = `${work.rec.length} 条工作日志`
	for (const w of work.rec) {
		const d = (el.appendChild(tl[1].cloneNode(true)) as HTMLElement).children;
		const name = uname.get(w.uid)!;
		(d[0] as HTMLElement).innerText = name[0];
		((d[1] as HTMLElement).children[0].children[0] as HTMLElement).innerText = name;
		//ebadge(d[1].children[0].children[1], m.badge)
		(d[1].children[1] as HTMLElement).innerText = from_utc(w._id.utc)
		switch (w.op) {
			case "goal": (d[1].children[2] as HTMLElement).innerText =
				`更新 ${aname.get(w._id.aid)} 目标进度 ${w.goal.map(g => `${g.name}: ${g.pct}%`).join(",")}`; break
			case "work": (d[1].children[2] as HTMLElement).innerText = w.msg; break
			case "video": {
				(d[1].children[2] as HTMLElement).innerText = "发布了视频："
				const v = d[1].children[2].appendChild(tv.cloneNode(true)) as HTMLLinkElement
				v.innerText = w.title
				v.href = w.src
				break
			}
		}

	}
	const foot = el.appendChild(tl[0].cloneNode(true)) as HTMLElement
	foot.innerText = head.innerText
}
function elog_fund(
	el: HTMLElement,
	fund: Rec["fund"]
) {
	const uname = new Map(fund.uname)
	const aname = new Map(fund.aname)
	el.innerHTML = ""
	const tl = (document.getElementById("log-item") as HTMLTemplateElement).content.children
	const head = el.appendChild(tl[0].cloneNode(true)) as HTMLElement
	head.innerText = `${fund.rec.length} 名支持者`
	for (const f of fund.rec) {
		const d = (el.appendChild(tl[1].cloneNode(true)) as HTMLElement).children;
		const name = uname.get(f.uid)!;
		(d[0] as HTMLElement).innerText = name[0];
		((d[1] as HTMLElement).children[0].children[0] as HTMLElement).innerText = name;
		//ebadge(d[1].children[0].children[1], m.badge)
		(d[1].children[1] as HTMLElement).innerText = from_utc(f._id.utc);
		(d[1].children[2] as HTMLElement).innerText = `${f.msg} 支持 ${aname.get(f._id.aid)}`
	}
	const foot = el.appendChild(tl[0].cloneNode(true)) as HTMLElement
	foot.innerText = head.innerText
}
function erec(
	el: HTMLElement,
	{ worker, work, fund }: Rec
) {
	const tab = el.getElementsByClassName("tab")[0].children;
	(tab[0].children[0] as HTMLElement).innerText = work.rec.length.toString();
	(tab[1].children[0] as HTMLElement).innerText = worker.rec.length.toString();
	(tab[2].children[0] as HTMLElement).innerText = fund.rec.length.toString();
	const log = [...el.getElementsByClassName("log")]
	elog_work(log[0] as HTMLElement, work)
	elog_worker(log[1] as HTMLElement, worker)
	elog_fund(log[2] as HTMLElement, fund)
	log.forEach(l => (l as HTMLElement).style.display = "none")
	const toggle = (b: HTMLElement, n: number) => {
		if (b.classList.contains("dark-gray")) {
			b.classList.remove("dark-gray");
			(log[n] as HTMLElement).style.display = "none"
		} else {
			for (const t of tab) t.classList.remove("dark-gray")
			log.forEach(l => (l as HTMLElement).style.display = "none")
			b.classList.add("dark-gray");
			(log[n] as HTMLElement).style.display = "block"
			log[n].scrollTop = log[n].scrollHeight
		}
	}
	tab[0].addEventListener("click", () => toggle(tab[0] as HTMLElement, 0))
	tab[1].addEventListener("click", () => toggle(tab[1] as HTMLElement, 1))
	tab[2].addEventListener("click", () => toggle(tab[2] as HTMLElement, 2))
}

async function eagenda(
	el: HTMLElement
) {
	el.innerHTML = ""
	const aid = parseInt(hash)
	const ds = isNaN(aid)
		//? (hash.length > 0 ? agenda.filter(a => a.tag.includes(hash)) : articles)
		? agenda
		: agenda.filter(p => p._id === aid)
	const ta = (document.getElementById("article") as HTMLTemplateElement).content.children[0]
	for (const d of ds) {
		const a = el.appendChild(ta.cloneNode(true)) as HTMLElement
		etitle(a.getElementsByClassName("title")[0] as HTMLElement, d)
		eimg(a.getElementsByClassName("photo")[0] as HTMLElement, d)
		estat(a.getElementsByClassName("stat")[0] as HTMLElement, d)
		erec(a.getElementsByClassName("msg")[0] as HTMLElement, await json(`a${d._id}`))
	}
}

function erecent(
	el: HTMLElement
) {
	el.innerHTML = ""
	elog_work(el, recent)
}

window.addEventListener("hashchange", () => {
	hash = decodeURI(window.location.hash).substr(1)
	// etag(
	// 	document.getElementsByTagName("header")[0].getElementsByClassName("tag")[0],
	// 	tags, true
	// )
	eagenda(document.getElementsByClassName("main")[0] as HTMLElement)
	erecent(document.getElementsByClassName("recent")[0] as HTMLElement)
})

async function load(
) {
	[agenda, recent] = await Promise.all([
		await json("agenda"),
		await json("recent"),
	])
	window.dispatchEvent(new Event("hashchange"))
}

load()
