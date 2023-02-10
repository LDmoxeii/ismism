// deno-lint-ignore-file no-window-prefix
import type { DocC, DocU } from "../../src/db.ts"
import type { Aut, Id } from "../../src/eid/typ.ts"
import { adm, adm1_def, adm2_def } from "../../src/ont/adm.ts"
import { utc_medium } from "../../src/ont/utc.ts"
import type { Pas } from "../../src/pra/pas.ts"
import type { PasCode, UsrAct } from "../../src/pra/pos.ts"
import type { Soc, Usr } from "../../src/pra/que.ts"

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


function bind(
	tid: string,
	ecl: string[],
): [DocumentFragment, HTMLElement[]] {
	const temp = document.getElementById(tid) as HTMLTemplateElement
	const t = temp.content.cloneNode(true) as DocumentFragment
	return [t, ecl.map(c => t.querySelector(`.${c}`)!)]
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
	el: {
		id_e: HTMLElement,
		adm_e: HTMLElement, utc_e: HTMLElement,
		rej_e: HTMLElement, ref_e: HTMLElement, rejc_e: HTMLElement, refc_e: HTMLElement, proc_e: HTMLElement,
	},
): boolean {
	let pro: null | "rej" | "ref" = null
	if (id.rej.length >= 2) pro = "rej"
	else if (id.ref.length < 2) pro = "ref"
	const pub: boolean = pro === null || (pas !== null && is_aut(pas, "pro_usr"))

	if (pro === "rej") {
		el.id_e.classList.add("red")
		el.proc_e.classList.add("red")
	} else if (pro === "ref") {
		el.id_e.classList.add("green")
		el.proc_e.classList.add("green")
	} else el.proc_e.classList.add("gray")

	el.adm_e.innerText = `${id.adm1} ${id.adm2}`
	el.utc_e.innerText = `${utc_medium(id.utc)}`
	idanchor(id.rej, idnam, el.rej_e, "")
	idanchor(id.ref, idnam, el.ref_e, "")

	if (id.rej.length >= 2) {
		el.rej_e.classList.add("red")
		el.rejc_e.classList.add("red")
	} else el.rejc_e.classList.add("gray")
	if (id.ref.length < 2) {
		el.ref_e.classList.add("green")
		el.refc_e.classList.add("green")
	} else el.refc_e.classList.add("gray")

	return pub
}

function pasact(
) {
	const [pasact_t, [
		nbr_e, send_e,
		adm_e, adm1_e, adm2_e,
		pre_e, actid_e, act_e,
		pas_e, code_e, issue_e,
		hint_e,
	]] = bind("pasact", [
		"nbr", "send",
		"adm", "adm1", "adm2",
		"pre", "actid", "act",
		"pas", "code", "issue",
		"hint",
	]) as [DocumentFragment, [
		HTMLInputElement, HTMLButtonElement,
		HTMLElement, HTMLSelectElement, HTMLSelectElement,
		HTMLElement, HTMLInputElement, HTMLButtonElement,
		HTMLElement, HTMLInputElement, HTMLButtonElement,
		HTMLElement,
	]]

	const send = async () => {
		if (!/^1\d{10}$/.test(nbr_e.value)) { alert("无效手机号"); return }
		nbr_e.readOnly = send_e.disabled = true
		const sent = await pos<PasCode>("pas", { nbr: nbr_e.value, sms: location.hostname === "ismist.cn" })
		if (sent) {
			const utc = sent.utc ? `\n上次发送：${utc_medium(sent.utc)}` : ""
			hint_e.innerText = `验证码已发送，可多次使用\n一小时内不再重复发送${utc}`
			pas_e.classList.remove("none")
		} else {
			hint_e.innerText = `手机号未注册\n输入居住地与注册激活码\n激活码只能使用一次，确认手机号无误`
			selopt(adm1_e, adm.keys())
			adm1_e.value = adm1_def
			selopt(adm2_e, adm.get(adm1_def)!)
			adm2_e.value = adm2_def
			adm1_e.addEventListener("change", () => selopt(adm2_e, adm.get(adm1_e.value)!))
			adm_e.classList.remove("none")
			pre_e.classList.remove("none")
		}
	}
	send_e.addEventListener("click", send)

	act_e.addEventListener("click", async () => {
		if (!actid_e.checkValidity()) { alert("无效激活码"); return }
		actid_e.readOnly = act_e.disabled = adm1_e.disabled = adm2_e.disabled = true

		const uid = await pos<UsrAct>("pre", { actid: actid_e.value, nbr: nbr_e.value, adm1: adm1_e.value, adm2: adm2_e.value })
		if (uid) {
			await send()
			pas_e.classList.remove("none")
		} else {
			actid_e.readOnly = act_e.disabled = adm1_e.disabled = adm2_e.disabled = false
			alert("无效激活码")
		}
	})

	issue_e.addEventListener("click", () => {
		if (!code_e.checkValidity()) { alert("无效验证码"); return }
		code_e.readOnly = issue_e.disabled = true
		pos<Pas>("pas", { nbr: nbr_e.value, code: parseInt(code_e.value) }).then(p => {
			if (!p) {
				code_e.readOnly = issue_e.disabled = false
				alert("无效验证码")
				return
			}
			pas = p
			pas_a.innerText = p.nam
			pas_a.href = `#${p.id.uid}`
			location.hash = `#${p.id.uid}`
		})
	})

	main.append(pasact_t)
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

	const [usr_t, [
		idnam_e, id_e, nam_e,
		adm_e, utc_e, rej_e, ref_e, rejc_e, refc_e, proc_e,
		intro_e,
		soc_e,
		rec_e,
		pos_e, put_e, pas_e,
		pre_e, preusr_e, presoc_e, preagd_e,
		pro_e, prorej_e, proref_e,
	]] = bind("usr", [
		"idnam", "id", "nam",
		"adm", "utc", "rej", "ref", "rejc", "refc", "proc",
		"intro",
		"soc",
		"rec",
		"pos", "put", "pas",
		"pre", "preusr", "presoc", "preagd",
		"pro", "prorej", "proref",
	]) as [DocumentFragment, [
		HTMLAnchorElement, HTMLElement, HTMLElement,
		HTMLElement, HTMLElement, HTMLElement, HTMLElement, HTMLElement, HTMLElement, HTMLElement,
		HTMLParagraphElement,
		HTMLParagraphElement,
		HTMLElement,
		HTMLElement, HTMLButtonElement, HTMLButtonElement,
		HTMLElement, HTMLButtonElement, HTMLButtonElement, HTMLButtonElement,
		HTMLElement, HTMLButtonElement, HTMLButtonElement,
	]]

	idnam_e.href = `#${uid}`
	id_e.innerText = `${uid}`
	nam_e.innerText = u.nam
	const unam = new Map(u.unam)
	let pub = idmeta(u, unam, { id_e, adm_e, utc_e, rej_e, ref_e, rejc_e, refc_e, proc_e })
	if (pas && pas.id.uid === uid) pub = true
	if (pub) {
		intro_e.innerText = u.intro.length > 0 ? u.intro : "无"
		const snam = new Map(u.snam)
		soc_e.innerText = `${u.snam.length > 0 ? "" : "无"}`
		idanchor([...u.snam.keys()], snam, soc_e, "s")
		rec_e.innerText = JSON.stringify(u.nrec)
	} else {
		nam_e.innerText = intro_e.innerText = soc_e.innerText = rec_e.innerText = "【冻结中】"
	}

	if (pas) {
		if (pas.id.uid === uid) {
			pro_e.remove()
			put_e.addEventListener("click", () => putusr(u))
			pas_e.addEventListener("click", async () => {
				await pos("pas", { uid })
				pas = null
				pas_a.innerText = "用户登录"
				pas_a.href = "#pas"
				location.href = `#pas`
			})
			if (not_aut(pas, "pre_usr")) preusr_e.remove()
			else preusr_e.addEventListener("click", () => pre("创建用户"))
			if (not_aut(pas, "pre_soc")) presoc_e.remove()
			else presoc_e.addEventListener("click", () => pre("创建社团"))
			if (not_aut(pas, "pre_agd")) preagd_e.remove()
			else preagd_e.addEventListener("click", () => pre("创建活动"))
		} else {
			pos_e.remove()
			pre_e.remove()
			const prorej = !u.rej.includes(pas.id.uid)
			const proref = !u.ref.includes(pas.id.uid)
			prorej_e.innerText = prorej ? "反对" : "取消反对"
			proref_e.innerText = proref ? "推荐" : "取消推荐"
			if (not_aut(pas, "pro_usr") || not_pro(pas) || pas.ref.includes(uid)) {
				prorej_e.disabled = true
				proref_e.disabled = true
			} else {
				prorej_e.addEventListener("click", async () => {
					prorej_e.disabled = true
					const c = await pos<DocU>("pro", { re: "rej", uid, pro: prorej })
					if (c && c > 0) setTimeout(() => usr(uid), 500)
					else prorej_e.disabled = false
				})
				proref_e.addEventListener("click", async () => {
					proref_e.disabled = true
					const c = await pos<DocU>("pro", { re: "ref", uid, pro: proref })
					if (c && c > 0) setTimeout(() => usr(uid), 500)
					else proref_e.disabled = false
				})
			}
		}
	} else {
		pos_e.remove()
		pre_e.remove()
		pro_e.remove()
	}

	main.append(usr_t)
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
		const [soc_t, [
			idnam_e, id_e, nam_e,
			adm_e, utc_e, rej_e, ref_e, rejc_e, refc_e, proc_e,
			sec_e, uid_e, res_e, intro_e, rec_e,
			put_e, putpre_e, putsec_e, putuid_e, putres_e,
			pro_e, prorej_e, proref_e,
		]] = bind("soc", [
			"idnam", "id", "nam",
			"adm", "utc", "rej", "ref", "rejc", "refc", "proc",
			"sec", "uid", "res", "intro", "rec",
			"put", "putpre", "putsec", "putuid", "putres",
			"pro", "prorej", "proref",
		]) as [DocumentFragment, [
			HTMLAnchorElement, HTMLElement, HTMLElement,
			HTMLElement, HTMLElement, HTMLElement, HTMLElement, HTMLElement, HTMLElement, HTMLElement,
			HTMLElement, HTMLElement, HTMLElement, HTMLElement, HTMLElement,
			HTMLElement, HTMLButtonElement, HTMLButtonElement, HTMLButtonElement, HTMLButtonElement,
			HTMLElement, HTMLButtonElement, HTMLButtonElement,
		]]

		idnam_e.href = `#s${s._id}`
		id_e.innerText = `s${s._id}`
		if (hash === id_e.innerText) id_e.classList.add("active")
		nam_e.innerText = s.nam
		const unam = new Map(s.unam)
		const pub = idmeta(s, unam, { id_e, adm_e, utc_e, rej_e, ref_e, rejc_e, refc_e, proc_e })
		if (pub) {
			idanchor(s.sec, unam, sec_e, "")
			idanchor(s.uid, unam, uid_e, "")
			idanchor(s.res, unam, res_e, "")
			intro_e.innerText = s.intro
			rec_e.innerText = JSON.stringify(s.nrec)
		} else {
			sec_e.innerText = uid_e.innerText = res_e.innerText = intro_e.innerText = rec_e.innerText = "【冻结中】"
		}

		if (pas) {
			if (not_aut(pas, "pre_soc")) putpre_e.remove()
			else putpre_e.disabled = true
			if (!s.sec.includes(pas.id.uid)) putsec_e.remove()
			else putsec_e.disabled = true
			if (!s.uid.includes(pas.id.uid)) putuid_e.remove()
			else putuid_e.addEventListener("click", async () => {
				if (confirm("退出社团？")) {
					putuid_e.disabled = true
					const r = await pos<DocU>("put", { sid: s._id, uid: pas!.id.uid, pro: false })
					if (r && r > 0) {
						const h = `s${s._id}`
						if (hash === h) soc(s._id)
						else location.href = `#${h}`
					} else putuid_e.disabled = false
				}
			})
			if (s.uid.includes(pas.id.uid)) putres_e.remove()
			else {
				const res = !s.res.includes(pas.id.uid)
				putres_e.innerText = res ? "申请加入" : "取消申请"
				if (!res || pub && s.res.length < s.res_max) putres_e.addEventListener("click", async () => {
					putres_e.disabled = true
					const r = await pos<DocU>("put", { sid: s._id, res })
					if (r && r > 0) {
						const h = `s${s._id}`
						if (hash === h) soc(s._id)
						else location.href = `#${h}`
					} else putuid_e.disabled = false
				}); else putres_e.disabled = true
			}
			if (not_aut(pas, "pro_soc")) pro_e.remove()
			else {
				const prorej = !s.rej.includes(pas.id.uid)
				const proref = !s.ref.includes(pas.id.uid)
				prorej_e.innerText = prorej ? "反对" : "取消反对"
				proref_e.innerText = proref ? "推荐" : "取消推荐"
				if (not_pro(pas)) prorej_e.disabled = proref_e.disabled = true
				else {
					prorej_e.addEventListener("click", async () => {
						prorej_e.disabled = true
						const r = await pos<DocU>("pro", { re: "rej", sid: s._id, pro: prorej })
						if (r && r > 0) {
							const h = `s${s._id}`
							if (hash === h) soc(s._id)
							else location.href = `#${h}`
						} else prorej_e.disabled = false
					})
					proref_e.addEventListener("click", async () => {
						proref_e.disabled = true
						const r = await pos<DocU>("pro", { re: "ref", sid: s._id, pro: proref })
						if (r && r > 0) {
							const h = `s${s._id}`
							if (hash === h) soc(s._id)
							else location.href = `#${h}`
						} else proref_e.disabled = false
					})
				}
			}
		} else {
			put_e.remove()
			pro_e.remove()
		}

		main.append(soc_t)
	}
}

function pre(
	nam: "创建用户" | "创建社团" | "创建活动"
) {
	if (!pas) { location.href = `#pasact`; return }

	main.innerHTML = ""

	const [pre_t, [
		idnam_e, id_e, nam_e,
		meta_e, pnam_e, nbr_e,
		adm1_e, adm2_e, intro_e,
		pre_e, cancel_e,
	]] = bind("pre", [
		"idnam", "id", "nam",
		"meta", "pnam", "nbr",
		"adm1", "adm2", "intro",
		"pre", "cancel",
	]) as [DocumentFragment, [
		HTMLAnchorElement, HTMLElement, HTMLElement,
		HTMLElement, HTMLInputElement, HTMLInputElement,
		HTMLSelectElement, HTMLSelectElement, HTMLTextAreaElement,
		HTMLButtonElement, HTMLButtonElement,
	]]

	idnam_e.href = `#${pas.id.uid}`
	id_e.innerText = `${pas.id.uid}`
	nam_e.innerText = nam
	meta_e.innerText = `将作为推荐人${nam}`

	selopt(adm1_e, adm.keys())
	adm1_e.value = adm1_def
	selopt(adm2_e, adm.get(adm1_def)!)
	adm2_e.value = adm2_def
	adm1_e.addEventListener("change", () => selopt(adm2_e, adm.get(adm1_e.value)!))

	let param: () => Record<string, string>
	let pf = ""
	switch (nam) {
		case "创建用户": {
			meta_e.innerText += `\n新用户可通过手机号登录、编辑用户信息`
			pnam_e.parentElement?.remove()
			intro_e.parentElement?.remove()
			param = () => ({ nbr: nbr_e.value, adm1: adm1_e.value, adm2: adm2_e.value })
			break
		} case "创建社团": case "创建活动": {
			nbr_e.parentElement?.remove()
			intro_e.addEventListener("input", () => {
				intro_e.style.height = "auto"
				intro_e.style.height = `${intro_e.scrollHeight}px`;
				(intro_e.previousElementSibling as HTMLElement).innerText = `简介：（${intro_e.value.length} / 2048 个字符）`
			})
			param = () => ({
				...nam === "创建社团" ? { snam: pnam_e.value } : { anam: pnam_e.value },
				adm1: adm1_e.value, adm2: adm2_e.value, intro: intro_e.value
			})
			pf = nam === "创建社团" ? "s" : "a"
			break
		} default: { usr(pas.id.uid); return }
	}

	pre_e.addEventListener("click", async () => {
		const id = await pos<DocC<Id["_id"]>>("pre", param())
		if (id) setTimeout(() => location.hash = `#${pf}${id}`, 500)
		else alert(`${nam}失败`)
	})
	cancel_e.addEventListener("click", () => usr(pas!.id.uid))

	main.append(pre_t)
}

function putusr(
	u: NonNullable<Usr>
) {
	main.innerHTML = ""

	const [putusr_t, [
		idnam_e, id_e,
		nam_e, adm1_e, adm2_e, intro_e,
		put_e, cancel_e,
	]] = bind("putusr", [
		"idnam", "id",
		"nam", "adm1", "adm2", "intro",
		"put", "cancel",
	]) as [DocumentFragment, [
		HTMLAnchorElement, HTMLElement,
		HTMLInputElement, HTMLSelectElement, HTMLSelectElement, HTMLTextAreaElement,
		HTMLButtonElement, HTMLButtonElement,
	]]

	idnam_e.href = `#${u._id}`
	id_e.innerText = `${u._id}`

	nam_e.value = u.nam
	selopt(adm1_e, adm.keys())
	adm1_e.value = u.adm1
	selopt(adm2_e, adm.get(u.adm1)!)
	adm2_e.value = u.adm2
	adm1_e.addEventListener("change", () => selopt(adm2_e, adm.get(adm1_e.value)!))
	intro_e.value = u.intro
	intro_e.addEventListener("input", () => {
		intro_e.style.height = "auto"
		intro_e.style.height = `${intro_e.scrollHeight}px`;
		(intro_e.previousElementSibling as HTMLElement).innerText = `简介：（${intro_e.value.length} / 2048 个字符）`
	})
	setTimeout(() => intro_e.dispatchEvent(new Event("input")), 50)

	put_e.addEventListener("click", async () => {
		put_e.disabled = true
		const c = await pos<DocU>("put", {
			uid: u._id,
			nam: nam_e.value,
			adm1: adm1_e.value,
			adm2: adm2_e.value,
			intro: intro_e.value.trim(),
		})
		if (c === null || c === 0) {
			alert(`无效输入\n或用户名已被占用`)
			put_e.disabled = false
		} else {
			pas_a.innerText = nam_e.value
			setTimeout(() => usr(u._id), 500)
		}
	})
	cancel_e.addEventListener("click", () => usr(u._id))

	main.append(putusr_t)
}

function idnull(
	id: string,
	meta: string,
) {
	main.innerHTML = ""

	const [idnull_t, [
		id_e, meta_e
	]] = bind("idnull", [
		"id", "meta"
	])
	id_e.innerText = id
	meta_e.innerText = meta;
	main.append(idnull_t)
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
