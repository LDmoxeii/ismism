// deno-lint-ignore-file no-window-prefix
import type { DocC, DocU } from "../../src/db.ts"
import type { Aut, Id } from "../../src/eid/typ.ts"
import { adm, adm1_def, adm2_def } from "../../src/ont/adm.ts"
import { utc_medium } from "../../src/ont/utc.ts"
import type { Pas } from "../../src/pra/pas.ts"
import type { PasCode, UsrAct } from "../../src/pra/pos.ts"
import type { Soc, Usr } from "../../src/pra/que.ts"
import { bind } from "./template.ts"

let hash = ""
let pas: Pas | null = null
let utc_etag = Date.now()
const main = document.getElementById("main")!
const pas_a = document.getElementById("pas")! as HTMLAnchorElement

async function que<T>(
	q: string
) {
	const res = await fetch(`/q/${q}`)
	const etag = res.headers.get("etag")?.substring(3)
	if (etag) utc_etag = parseInt(etag)
	return res.json() as T
}

async function pos<T>(
	f: string, b: Record<string, string | number | boolean>
) {
	const res = await fetch(`/p/${f}`, {
		method: "POST",
		body: JSON.stringify(b)
	})
	return res.json() as T
}

function is_aut(
	pas: Pas,
	aut: Aut["p"][0],
): boolean {
	return pas.aut.includes(aut)
}
function not_aut(
	pas: Pas,
	aut: Aut["p"][0],
) {
	return !is_aut(pas, aut)
}
function is_pro(
	{ rej, ref }: Pas,
): boolean {
	return rej.length < 2 && ref.length >= 2
}
function not_pro(
	pas: Pas,
) {
	return !is_pro(pas)
}

function selopt(
	sel: HTMLSelectElement,
	ts: Iterable<string>,
) {
	sel.options.length = 0
	for (const t of ts) {
		const opt = document.createElement("option")
		opt.text = t
		sel.add(opt)
	}
}

function idanchor(
	id: number[],
	idnam: Map<Id["_id"], Id["nam"]>,
	el: HTMLElement,
	pf: "" | "s" | "a",
) {
	if (id.length === 0) { el.innerText = "无"; return }
	id.forEach(id => {
		const a = el.appendChild(document.createElement("a"))
		a.href = `#${pf}${id}`
		a.innerText = idnam.get(id) ?? `${id}`
	})
}

function idmeta(
	id: NonNullable<Usr | Soc>,
	idnam: Map<Id["_id"], Id["nam"]>,
	t: {
		id: HTMLElement,
		adm: HTMLElement, utc: HTMLElement,
		rej: HTMLElement, ref: HTMLElement,
		rejc: HTMLElement, refc: HTMLElement, proc: HTMLElement,
	},
): boolean {
	let pro: null | "rej" | "ref" = null
	if (id.rej.length >= 2) pro = "rej"
	else if (id.ref.length < 2) pro = "ref"
	const pub: boolean = pro === null || (pas !== null && is_aut(pas, "pro_usr"))

	if (pro === "rej") {
		t.id.classList.add("red")
		t.proc.classList.add("red")
	} else if (pro === "ref") {
		t.id.classList.add("green")
		t.proc.classList.add("green")
	} else t.proc.classList.add("gray")

	t.adm.innerText = `${id.adm1} ${id.adm2}`
	t.utc.innerText = `${utc_medium(id.utc)}`
	idanchor(id.rej, idnam, t.rej, "")
	idanchor(id.ref, idnam, t.ref, "")

	if (id.rej.length >= 2) {
		t.rej.classList.add("red")
		t.rejc.classList.add("red")
	} else t.rejc.classList.add("gray")
	if (id.ref.length < 2) {
		t.ref.classList.add("green")
		t.refc.classList.add("green")
	} else t.refc.classList.add("gray")

	return pub
}

function pasact(
) {
	const t = bind("pasact")
	const send = async () => {
		if (!/^1\d{10}$/.test(t.nbr.value)) { alert("无效手机号"); return }
		t.nbr.readOnly = t.send.disabled = true
		const sent = await pos<PasCode>("pas", { nbr: t.nbr.value, sms: location.hostname === "ismist.cn" })
		if (sent) {
			const utc = sent.utc ? `\n上次发送：${utc_medium(sent.utc)}` : ""
			t.hint.innerText = `验证码已发送，可多次使用\n一小时内不再重复发送${utc}`
			t.pas.classList.remove("none")
		} else {
			t.hint.innerText = `手机号未注册\n输入居住地与注册激活码\n激活码只能使用一次，确认手机号无误`
			selopt(t.adm1, adm.keys())
			t.adm1.value = adm1_def
			selopt(t.adm2, adm.get(adm1_def)!)
			t.adm2.value = adm2_def
			t.adm1.addEventListener("change", () => selopt(t.adm2, adm.get(t.adm1.value)!))
			t.adm.classList.remove("none")
			t.pre.classList.remove("none")
		}
	}
	t.send.addEventListener("click", send)

	t.act.addEventListener("click", async () => {
		if (!t.actid.checkValidity()) { alert("无效激活码"); return }
		t.actid.readOnly = t.act.disabled = t.adm1.disabled = t.adm2.disabled = true

		const uid = await pos<UsrAct>("pre", { actid: t.actid.value, nbr: t.nbr.value, adm1: t.adm1.value, adm2: t.adm2.value })
		if (uid) {
			await send()
			t.pas.classList.remove("none")
		} else {
			t.actid.readOnly = t.act.disabled = t.adm1.disabled = t.adm2.disabled = false
			alert("无效激活码")
		}
	})

	t.issue.addEventListener("click", () => {
		if (!t.code.checkValidity()) { alert("无效验证码"); return }
		t.code.readOnly = t.issue.disabled = true
		pos<Pas>("pas", { nbr: t.nbr.value, code: parseInt(t.code.value) }).then(p => {
			if (!p) {
				t.code.readOnly = t.issue.disabled = false
				alert("无效验证码")
				return
			}
			pas = p
			pas_a.innerText = p.nam
			pas_a.href = `#${p.id.uid}`
			location.hash = `#${p.id.uid}`
		})
	})

	main.append(t.bind)
}

async function usr(
	uid: NonNullable<Usr>["_id"]
) {
	const u = await que<Usr>(`usr?uid=${uid}`)

	if (!u) {
		idnull(`${uid}`, `ismist.cn#${uid} 是无效用户`)
		return
	}

	main.innerHTML = ""

	const t = bind("usr")

	t.idnam.href = `#${uid}`
	t.id.innerText = `${uid}`
	t.nam.innerText = u.nam
	const unam = new Map(u.unam)
	let pub = idmeta(u, unam, t)
	if (pas && pas.id.uid === uid) pub = true
	if (pub) {
		t.intro.innerText = u.intro.length > 0 ? u.intro : "无"
		const snam = new Map(u.snam)
		t.soc.innerText = `${u.snam.length > 0 ? "" : "无"}`
		idanchor([...u.snam.keys()], snam, t.soc, "s")
		t.rec.innerText = JSON.stringify(u.nrec)
	} else {
		t.nam.innerText = t.intro.innerText = t.soc.innerText = t.rec.innerText = "【冻结中】"
	}

	if (pas) {
		if (pas.id.uid === uid) {
			t.pro.remove()
			t.put.addEventListener("click", () => putusr(u))
			t.pas.addEventListener("click", async () => {
				await pos("pas", { uid })
				pas = null
				pas_a.innerText = "用户登录"
				pas_a.href = "#pas"
				location.href = `#pas`
			})
			if (not_aut(pas, "pre_usr")) t.preusr.remove()
			else t.preusr.addEventListener("click", () => pre("创建用户"))
			if (not_aut(pas, "pre_soc")) t.presoc.remove()
			else t.presoc.addEventListener("click", () => pre("创建社团"))
			if (not_aut(pas, "pre_agd")) t.preagd.remove()
			else t.preagd.addEventListener("click", () => pre("创建活动"))
		} else {
			t.pos.remove()
			t.pre.remove()
			const prorej = !u.rej.includes(pas.id.uid)
			const proref = !u.ref.includes(pas.id.uid)
			t.prorej.innerText = prorej ? "反对" : "取消反对"
			t.proref.innerText = proref ? "推荐" : "取消推荐"
			if (not_aut(pas, "pro_usr") || not_pro(pas) || pas.ref.includes(uid)) {
				t.prorej.disabled = true
				t.proref.disabled = true
			} else {
				t.prorej.addEventListener("click", async () => {
					t.prorej.disabled = true
					const c = await pos<DocU>("pro", { re: "rej", uid, pro: prorej })
					if (c && c > 0) setTimeout(() => usr(uid), 500)
					else t.prorej.disabled = false
				})
				t.proref.addEventListener("click", async () => {
					t.proref.disabled = true
					const c = await pos<DocU>("pro", { re: "ref", uid, pro: proref })
					if (c && c > 0) setTimeout(() => usr(uid), 500)
					else t.proref.disabled = false
				})
			}
		}
	} else {
		t.pos.remove()
		t.pre.remove()
		t.pro.remove()
	}

	main.append(t.bind)
}

async function soc(
	sid?: NonNullable<Soc>["_id"]
) {
	let ss = sid ? [await que<Soc>(`soc?sid=${sid}`)] : await que<Soc[]>("soc")
	ss = ss.filter(s => s)

	if (sid && ss.length === 0) {
		idnull(`s${sid}`, `ismist.cn#s${sid} 是无效社团`)
		return
	}

	main.innerHTML = ""

	for (const s of ss) {
		if (!s) continue
		const t = bind("soc")

		t.idnam.href = `#s${s._id}`
		t.id.innerText = `s${s._id}`
		if (hash === t.id.innerText) t.id.classList.add("active")
		t.nam.innerText = s.nam
		const unam = new Map(s.unam)
		const pub = idmeta(s, unam, t)
		if (pub) {
			idanchor(s.sec, unam, t.sec, "")
			idanchor(s.uid, unam, t.uid, "")
			idanchor(s.res, unam, t.res, "")
			t.intro.innerText = s.intro
			t.rec.innerText = JSON.stringify(s.nrec)
		} else {
			t.sec.innerText = t.uid.innerText = t.res.innerText = t.intro.innerText = t.rec.innerText = "【冻结中】"
		}

		if (pas) {
			if (not_aut(pas, "pre_soc")) t.putpre.remove()
			else t.putpre.disabled = true
			if (!s.sec.includes(pas.id.uid)) t.putsec.remove()
			else t.putsec.disabled = true
			if (!s.uid.includes(pas.id.uid)) t.putuid.remove()
			else t.putuid.addEventListener("click", async () => {
				if (confirm("退出社团？")) {
					t.putuid.disabled = true
					const r = await pos<DocU>("put", { sid: s._id, uid: pas!.id.uid, pro: false })
					if (r && r > 0) {
						const h = `s${s._id}`
						if (hash === h) soc(s._id)
						else location.href = `#${h}`
					} else t.putuid.disabled = false
				}
			})
			if (s.uid.includes(pas.id.uid)) t.putres.remove()
			else {
				const res = !s.res.includes(pas.id.uid)
				t.putres.innerText = res ? "申请加入" : "取消申请"
				if (!res || pub && s.res.length < s.res_max) t.putres.addEventListener("click", async () => {
					t.putres.disabled = true
					const r = await pos<DocU>("put", { sid: s._id, res })
					if (r && r > 0) {
						const h = `s${s._id}`
						if (hash === h) soc(s._id)
						else location.href = `#${h}`
					} else t.putuid.disabled = false
				}); else t.putres.disabled = true
			}
			if (not_aut(pas, "pro_soc")) t.pro.remove()
			else {
				const prorej = !s.rej.includes(pas.id.uid)
				const proref = !s.ref.includes(pas.id.uid)
				t.prorej.innerText = prorej ? "反对" : "取消反对"
				t.proref.innerText = proref ? "推荐" : "取消推荐"
				if (not_pro(pas)) t.prorej.disabled = t.proref.disabled = true
				else {
					t.prorej.addEventListener("click", async () => {
						t.prorej.disabled = true
						const r = await pos<DocU>("pro", { re: "rej", sid: s._id, pro: prorej })
						if (r && r > 0) {
							const h = `s${s._id}`
							if (hash === h) soc(s._id)
							else location.href = `#${h}`
						} else t.prorej.disabled = false
					})
					t.proref.addEventListener("click", async () => {
						t.proref.disabled = true
						const r = await pos<DocU>("pro", { re: "ref", sid: s._id, pro: proref })
						if (r && r > 0) {
							const h = `s${s._id}`
							if (hash === h) soc(s._id)
							else location.href = `#${h}`
						} else t.proref.disabled = false
					})
				}
			}
		} else {
			t.put.remove()
			t.pro.remove()
		}

		main.append(t.bind)
	}
}

function pre(
	nam: "创建用户" | "创建社团" | "创建活动"
) {
	if (!pas) { location.href = `#pasact`; return }

	main.innerHTML = ""

	const t = bind("pre")

	t.idnam.href = `#${pas.id.uid}`
	t.id.innerText = `${pas.id.uid}`
	t.nam.innerText = nam
	t.meta.innerText = `将作为推荐人${nam}`

	selopt(t.adm1, adm.keys())
	t.adm1.value = adm1_def
	selopt(t.adm2, adm.get(adm1_def)!)
	t.adm2.value = adm2_def
	t.adm1.addEventListener("change", () => selopt(t.adm2, adm.get(t.adm1.value)!))

	let param: () => Record<string, string>
	let pf = ""
	switch (nam) {
		case "创建用户": {
			t.meta.innerText += `\n新用户可通过手机号登录、编辑用户信息`
			t.pnam.parentElement?.remove()
			t.intro.parentElement?.remove()
			param = () => ({ nbr: t.nbr.value, adm1: t.adm1.value, adm2: t.adm2.value })
			break
		} case "创建社团": case "创建活动": {
			t.nbr.parentElement?.remove()
			t.intro.addEventListener("input", () => {
				t.intro.style.height = "auto"
				t.intro.style.height = `${t.intro.scrollHeight}px`;
				(t.intro.previousElementSibling as HTMLElement).innerText = `简介：（${t.intro.value.length} / 2048 个字符）`
			})
			param = () => ({
				...nam === "创建社团" ? { snam: t.pnam.value } : { anam: t.pnam.value },
				adm1: t.adm1.value, adm2: t.adm2.value, intro: t.intro.value
			})
			pf = nam === "创建社团" ? "s" : "a"
			break
		} default: { usr(pas.id.uid); return }
	}

	t.pre.addEventListener("click", async () => {
		const id = await pos<DocC<Id["_id"]>>("pre", param())
		if (id) setTimeout(() => location.hash = `#${pf}${id}`, 500)
		else alert(`${nam}失败`)
	})
	t.cancel.addEventListener("click", () => usr(pas!.id.uid))

	main.append(t.bind)
}

function putusr(
	u: NonNullable<Usr>
) {
	main.innerHTML = ""

	const t = bind("putusr")

	t.idnam.href = `#${u._id}`
	t.id.innerText = `${u._id}`

	t.nam.value = u.nam
	selopt(t.adm1, adm.keys())
	t.adm1.value = u.adm1
	selopt(t.adm2, adm.get(u.adm1)!)
	t.adm2.value = u.adm2
	t.adm1.addEventListener("change", () => selopt(t.adm2, adm.get(t.adm1.value)!))
	t.intro.value = u.intro
	t.intro.addEventListener("input", () => {
		t.intro.style.height = "auto"
		t.intro.style.height = `${t.intro.scrollHeight}px`;
		(t.intro.previousElementSibling as HTMLElement).innerText = `简介：（${t.intro.value.length} / 2048 个字符）`
	})
	setTimeout(() => t.intro.dispatchEvent(new Event("input")), 50)

	t.put.addEventListener("click", async () => {
		t.put.disabled = true
		const c = await pos<DocU>("put", {
			uid: u._id,
			nam: t.nam.value,
			adm1: t.adm1.value,
			adm2: t.adm2.value,
			intro: t.intro.value.trim(),
		})
		if (c === null || c === 0) {
			alert(`无效输入\n或用户名已被占用`)
			t.put.disabled = false
		} else {
			pas_a.innerText = t.nam.value
			setTimeout(() => usr(u._id), 500)
		}
	})
	t.cancel.addEventListener("click", () => usr(u._id))

	main.append(t.bind)
}

function idnull(
	id: string,
	meta: string,
) {
	main.innerHTML = ""

	const t = bind("idnull")

	t.id.innerText = id
	t.meta.innerText = meta;

	main.append(t.bind)
}

window.addEventListener("hashchange", () => {
	hash = decodeURI(window.location.hash).substring(1)
	main.innerHTML = ""
	if (hash === "pas") pasact()
	else if (/^\d+$/.test(hash)) usr(parseInt(hash))
	else if (hash === "soc") soc()
	else if (/^s\d+$/.test(hash)) soc(parseInt(hash.substring(1)))
	else if (hash.startsWith("a")) que("agd").then(a => main.innerText = JSON.stringify(a))
})

async function load(
) {
	console.log("ismism-20230204")
	console.log(`\n主义主义开发小组！成员招募中！\n\n发送自我介绍至网站维护邮箱，或微信联系 728 万大可\n \n`)
	pas = await pos<Pas>("pas", {})
	if (pas) {
		pas_a.innerText = pas.nam
		pas_a.href = `#${pas.id.uid}`
	}
	window.dispatchEvent(new Event("hashchange"))
}
load()
