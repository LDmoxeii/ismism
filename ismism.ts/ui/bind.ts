// deno-lint-ignore-file no-window-prefix
import { utc_medium, utc_short } from "../src/ontic/utc.ts"
import type { Agenda, Soc, User } from "../src/query.ts"
import type { Goal, Tag, Rec, Work, Worker, Fund, Role } from "../src/typ.ts"
import type { NRec, RecOf } from "../src/db.ts"

const ver = "ismism-0.0.3-20221217"
let hash = ""
let agenda: Agenda
const role = new Map<number, Map<number, Role>>()
const tags_all: Tag[] = [
	"", "进行中", "已结束",
	"设施建设", "物资配给", "软件开发",
	"苏州", "成都",
	"工益公益", "星星家园"
]
const tags_count: number[] = []
let utc_etag = Date.now()

async function query(
	q: string
) {
	const res = await fetch(`/q/${q}`)
	const etag = res.headers.get("etag")?.substring(3)
	if (etag) utc_etag = parseInt(etag)
	return res.json()
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
		(a as HTMLAnchorElement).href = `#${tag}`
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
const roleclr_default = "amber"

function erec(
	{ _id: { uid, aid, utc } }: Rec,
	uname: Map<number, string>,
	aname: Map<number, string>,
	role: string | Map<number, Map<number, string>>
) {
	const [t, [cinit, cuname, crole, caname, cdate, cmsg]] = template("rec",
		["initial", "uname", "role", "aname", "date", "msg"])
	const n = uname.get(uid)!;
	(cinit as HTMLAnchorElement).href = `#u${uid}`;
	(cuname as HTMLAnchorElement).href = `#u${uid}`
	cinit.innerText = n[0]
	cuname.innerText = n
	if (n.includes("被除名")) {
		cinit.innerText = " "
		cuname.classList.add("expel")
	}
	const r = typeof role === "string" ? role : role.get(uid)?.get(aid)!
	crole.innerText = r;
	(crole as HTMLAnchorElement).href = `#u${uid}`
	crole.classList.add(roleclr.get(r) ?? roleclr_default)
	caname.innerText = aname.get(aid)!;
	(caname as HTMLAnchorElement).href = `#a${aid}`
	cdate.innerText = utc_short(utc)
	return { t, cmsg }
}

function ework(
	d: HTMLElement,
	work: RecOf<Work>,
) {
	const uname = new Map(work.uname)
	const aname = new Map(work.aname)
	work.urole.map(([uid, r]) => role.set(uid, new Map(r)))
	for (const w of work.rec.slice().reverse()) {
		const { t, cmsg } = erec(w, uname, aname, role)
		switch (w.op) {
			case "work": cmsg.innerText = w.msg; break
			case "video": {
				cmsg.innerText = "发布了视频："
				const [t, [a]] = template("video", ["video"])
				a.innerText = w.title;
				(a as HTMLAnchorElement).href = w.src
				cmsg.appendChild(t)
				break
			}
		}
		d.appendChild(t)
	}
}

function eworker(
	d: HTMLElement,
	worker: RecOf<Worker>,
) {
	const uname = new Map(worker.uname)
	const aname = new Map(worker.aname)
	worker.urole.map(([uid, r]) => role.set(uid, new Map(r)))
	for (const w of worker.rec.slice().reverse()) {
		const { t, cmsg } = erec(w, uname, aname, role)
		cmsg.innerText = `作为 ${w.role} 参与工作`
		d.appendChild(t)
	}
}

function efund(
	d: HTMLElement,
	fund: RecOf<Fund>
) {
	const uname = new Map(fund.uname)
	const aname = new Map(fund.aname)
	for (const f of fund.rec.slice().reverse()) {
		const { t, cmsg } = erec(f, uname, aname, "支持者")
		cmsg.innerText = `提供支持: +${f.fund}\n${f.msg}`
		d.appendChild(t)
	}
}

function erecof(
	b: [HTMLElement, HTMLElement, HTMLElement],
	d: [HTMLElement, HTMLElement, HTMLElement],
	nrec: [number, number, number],
	lrec: [() => Promise<void>, () => Promise<void>, () => Promise<void>]
) {
	const loaded = [false, false, false]
	const toggle = (n: number) => {
		const on = b[n].classList.contains("darkgray")
		b.forEach(b => b.classList.remove("darkgray"))
		d.forEach(d => d.style.display = "none")
		if (!loaded[n]) lrec[n]().then(() => {
			d[n].scrollTop = d[n].scrollHeight
			d[n].scrollIntoView(false)
			loaded[n] = true
		})
		if (!on) {
			b[n].classList.add("darkgray")
			d[n].style.display = "block"
			d[n].scrollTop = d[n].scrollHeight
		}
	}
	b.forEach((btn, n) => {
		btn.getElementsByTagName("span")[0].innerText = `${nrec[n]}`
		btn.addEventListener("click", () => toggle(n))
	})
}



function esum(
	el: HTMLElement,
	nrec: NRec
) {
	const [t, [
		bwork, bworker, bfund, dwork, dworker, dfund,
	]] = template("sum", [
		"tab.work", "tab.worker", "tab.fund", "rec.work", "rec.worker", "rec.fund",
	])
	erecof(
		[bwork, bworker, bfund],
		[dwork, dworker, dfund],
		[nrec.work, nrec.worker, nrec.fund], [
		async () => ework(dwork, await query(`rec_of_recent?coll=work&utc=${utc_etag}`)),
		async () => eworker(dworker, await query(`rec_of_recent?coll=worker&utc=${utc_etag}`)),
		async () => efund(dfund, await query(`rec_of_recent?coll=fund&utc=${utc_etag}`)),
	])
	el.appendChild(t)
}

function eagenda(
	el: HTMLElement,
	agenda: Agenda["agenda"],
	rec?: Agenda["nrec"],
) {
	el.innerHTML = ""

	if (rec) esum(el, rec)

	for (const {
		_id, name, tag, utc, imgsrc, fund, budget, expense, detail, goal, nrec
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

		(cidname as HTMLAnchorElement).href = `#a${_id}`
		cid.innerText = `a${_id}`
		if (hash === cid.innerText) cid.classList.add("darkgray")
		else cid.classList.remove("darkgray")
		cname.innerText = name
		etag(ctag, tag)
		cdate.innerText = `公示时间: ${utc_medium(utc)}\n更新时间：${utc_medium(utc_etag)}`

		if (!imgsrc || imgsrc.img.length === 0)
			cphoto.parentNode?.parentNode?.removeChild(cphoto.parentNode)
		else {
			cphoto_total.innerText = `${imgsrc.img.length}`
			let n = 0
			const nimg = (d: number) => {
				n = ((n + d) % imgsrc.img.length + imgsrc.img.length) % imgsrc.img.length
				cphoto_title.innerText = imgsrc.img[n].title
				cphoto_nbr.innerText = `${n + 1}`;
				(cphoto_img as HTMLImageElement).src = imgsrc.img[n].src
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
		(cdetail as HTMLAnchorElement).href = detail
		egoal(cgoal, goal)

		erecof(
			[bwork, bworker, bfund],
			[dwork, dworker, dfund],
			[nrec.work, nrec.worker, nrec.fund], [
			async () => ework(dwork, await query(`rec_of_aid?coll=work&aid=${_id}`)),
			async () => eworker(dworker, await query(`rec_of_aid?coll=worker&aid=${_id}`)),
			async () => efund(dfund, await query(`rec_of_aid?coll=fund&aid=${_id}`)),
		])

		el.appendChild(t)
	}
}

function euser(
	el: HTMLElement,
	uid: number,
	u: User
) {
	if (!u) {
		el.innerHTML = `无效用户: u${uid}`
		return
	} else el.innerHTML = ""

	const { name, utc, soc, nrec } = u
	const [t, [
		cidname, cid, cname, cdate, csoc,
		bwork, bworker, bfund, dwork, dworker, dfund,
	]] = template("user", [
		"idname", "id", "name", "date", "soc",
		"tab.work", "tab.worker", "tab.fund", "rec.work", "rec.worker", "rec.fund",
	]);

	(cidname as HTMLAnchorElement).href = `#u${uid}`
	cid.innerText = `u${uid}`
	if (hash === cid.innerText) cid.classList.add("darkgray")
	else cid.classList.remove("darkgray")
	cname.innerText = name
	if (name.includes("被除名")) cname.classList.add("expel")
	cdate.innerText = `注册时间: ${utc_medium(utc)}`

	if (soc.length === 0) csoc.innerText += "无"
	else for (const s of soc) {
		const a = csoc.appendChild(document.createElement("a"))
		a.classList.add("member-soc")
		a.href = `#s${s._id}`
		a.innerText = s.name
	}

	erecof(
		[bwork, bworker, bfund],
		[dwork, dworker, dfund],
		[nrec.work, nrec.worker, nrec.fund], [
		async () => ework(dwork, await query(`rec_of_uid?coll=work&uid=${uid}`)),
		async () => eworker(dworker, await query(`rec_of_uid?coll=worker&uid=${uid}`)),
		async () => efund(dfund, await query(`rec_of_uid?coll=fund&uid=${uid}`)),
	])

	el.appendChild(t)
}
function esoc(
	el: HTMLElement,
	sid: number,
	s: Soc
) {
	if (!s) {
		el.innerHTML = `无效团体: s${sid}`
		return
	} else el.innerHTML = ""
	const { name, utc, intro, uid, uname, nrec } = s

	const [t, [
		cidname, cid, cname, cdate, cintro, cuser,
		bwork, bworker, bfund, dwork, dworker, dfund,
	]] = template("soc", [
		"idname", "id", "name", "date", "intro", "user",
		"tab.work", "tab.worker", "tab.fund", "rec.work", "rec.worker", "rec.fund",
	]);

	(cidname as HTMLAnchorElement).href = `#s${sid}`
	cid.innerText = `s${sid}`
	if (hash === cid.innerText) cid.classList.add("darkgray")
	else cid.classList.remove("darkgray")
	cname.innerText = name
	cdate.innerText = `注册时间: ${utc_medium(utc)}`
	cintro.innerText += intro

	const user = new Map(uname)
	cuser.innerText = uid.length === 0 ? "社团成员：无" : `社团成员(${uid.length})：`
	for (const u of uid) {
		const a = cuser.appendChild(document.createElement("a"))
		a.classList.add("member-user")
		a.href = `#u${u}`
		a.innerText = user.get(u)!
		cuser.appendChild(a)
	}

	erecof(
		[bwork, bworker, bfund],
		[dwork, dworker, dfund],
		[nrec.work, nrec.worker, nrec.fund], [
		async () => ework(dwork, await query(`rec_of_sid?coll=work&sid=${sid}`)),
		async () => eworker(dworker, await query(`rec_of_sid?coll=worker&sid=${sid}`)),
		async () => efund(dfund, await query(`rec_of_sid?coll=fund&sid=${sid}`)),
	])

	el.appendChild(t)
}

window.addEventListener("hashchange", async () => {
	hash = decodeURI(window.location.hash).substring(1)
	etag(document.querySelector(".title div.tag")!, tags_all, tags_count)
	const main = document.getElementById("main")!
	switch (hash[0]) {
		case undefined: eagenda(main, agenda.agenda, agenda.nrec); break
		case "u": {
			const uid = parseInt(hash.substring(1))
			const u = uid > 0 ? await query(`user?uid=${uid}`) : null
			euser(main, uid, u)
			break
		} case "s": {
			const sid = parseInt(hash.substring(1))
			const s = sid > 0 ? await query(`soc?sid=${sid}`) : null
			esoc(main, sid, s)
			break
		} case "a": {
			const aid = parseInt(hash.substring(1))
			eagenda(main, agenda.agenda.filter(a => a._id === aid))
			break
		} default: eagenda(main, agenda.agenda.filter(a => a.tag.includes(hash as Tag))); break
	}
})

async function load(
) {
	agenda = await query("agenda")
	console.log(`\n主义主义开发小组！成员招募中！\n\n发送自我介绍至网站维护邮箱，或微信联系 728 万大可\n \n`)
	console.log(ver)
	console.log(`loaded ${agenda.agenda.length} agenda`)
	tags_count.push(agenda.agenda.length, ...tags_all.slice(1).map(
		t => agenda.agenda.filter(a => a.tag.includes(t)).length)
	)
	window.dispatchEvent(new Event("hashchange"))
}
load()
