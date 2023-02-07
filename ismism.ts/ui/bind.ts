// deno-lint-ignore-file no-window-prefix
import type { DocU } from "../src/db.ts"
import type { Aut } from "../src/eid/typ.ts"
import { adm } from "../src/ont/adm.ts"
import { utc_medium } from "../src/ont/utc.ts"
import type { Pas } from "../src/pra/pas.ts"
import type { PasCode, UsrAct } from "../src/pra/pos.ts"
import type { Usr } from "../src/pra/que.ts"

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
	el: HTMLElement,
	pf: "" | "s" | "a",
	id: number[],
	idnam: Map<number, string>,
) {
	id.forEach((id, n) => {
		const a = el.appendChild(document.createElement("a"))
		a.href = `#${pf}${id}`
		a.innerText = idnam.get(id) ?? `${id}`
		if (n > 0) a.classList.add("sep")
	})
}

function paspre(
) {
	const [paspre_t, [
		nbr_e, send_e,
		adm_e, adm1_e, adm2_e,
		pre_e, actid_e, act_e,
		pas_e, code_e, issue_e,
		hint_e,
	]] = bind("paspre", [
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
			const utc = sent.utc ? `上次发送：${utc_medium(sent.utc)}` : ""
			hint_e.innerText = `验证码已发送，可多次使用\n一小时内不再重复发送${utc}`
			pas_e.classList.remove("none")
		} else {
			hint_e.innerText = `手机号未注册\n输入居住地与注册激活码\n激活码只能使用一次，确认手机号无误`
			selopt(adm1_e, adm.keys())
			adm1_e.value = "江苏"
			selopt(adm2_e, adm.get("江苏")!)
			adm2_e.value = "苏州"
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

	main.append(paspre_t)
}

async function usr(
	uid: NonNullable<Usr>["_id"]
) {
	const u = await que<Usr>(`usr?uid=${uid}`)

	if (!u) {
		idnull(`${uid}`)
		return
	}

	main.innerHTML = ""

	const [usr_t, [
		idnam_e, id_e, nam_e,
		adm_e, utc_e, rej_e, ref_e,
		intro_e,
		soc_e,
		rec_e,
		pos_e, put_e, pas_e,
		pro_e, pro_rej_e, pro_ref_e,
	]] = bind("usr", [
		"idnam", "id", "nam",
		"adm", "utc", "rej", "ref",
		"intro",
		"soc",
		"rec",
		"pos", "put", "pas",
		"pro", "pro_rej", "pro_ref",
	]) as [DocumentFragment, [
		HTMLAnchorElement, HTMLElement, HTMLElement,
		HTMLElement, HTMLElement, HTMLElement, HTMLElement,
		HTMLParagraphElement,
		HTMLParagraphElement,
		HTMLElement,
		HTMLElement, HTMLButtonElement, HTMLButtonElement,
		HTMLElement, HTMLButtonElement, HTMLButtonElement,
	]]

	idnam_e.href = `#${uid}`
	id_e.innerText = `${uid}`
	nam_e.innerText = u.nam
	adm_e.innerText = `${u.adm1} ${u.adm2}`
	utc_e.innerText = `${utc_medium(u.utc)}`
	const unam = new Map(u.unam)
	rej_e.innerText = `${u.rej.length > 0 ? "" : "无"}`
	if (u.rej.length >= 2) rej_e.classList.add("red")
	else if (u.rej.length === 0) rej_e.classList.add("gray")
	idanchor(rej_e, "", u.rej, unam)
	ref_e.innerText = `${u.ref.length > 0 ? "" : "无"}`
	if (u.ref.length < 2) ref_e.classList.add("red")
	else if (u.ref.length === 0) ref_e.classList.add("gray")
	idanchor(ref_e, "", u.ref, unam)
	intro_e.innerText = `${u.intro.length > 0 ? u.intro : "无"}`
	const snam = new Map(u.snam)
	soc_e.innerText = `${u.snam.length > 0 ? "" : "无"}`
	idanchor(soc_e, "s", [...u.snam.keys()], snam)
	rec_e.innerText = JSON.stringify(u.nrec)

	if (pas) {
		if (pas.id.uid === uid) {
			pos_e.classList.remove("none")
			put_e.addEventListener("click", () => usrput(u))
			pas_e.addEventListener("click", async () => {
				await pos("pas", { uid })
				pas = null
				pas_a.innerText = "用户登录"
				pas_a.href = "#pas"
				location.href = `#pas`
			})
		} else pos_e.classList.add("none")
		const pro_rej = !u.rej.includes(pas.id.uid)
		const pro_ref = !u.ref.includes(pas.id.uid)
		pro_rej_e.innerText = pro_rej ? "反对" : "取消反对"
		pro_ref_e.innerText = pro_ref ? "推荐" : "取消推荐"
		if (not_aut(pas, "pro_usr") || not_pro(pas) || pas.ref.includes(uid)) {
			pro_rej_e.disabled = true
			pro_ref_e.disabled = true
		} else {
			pro_rej_e.addEventListener("click", async () => {
				pro_rej_e.disabled = true
				const c = await pos<DocU>("pro", { re: "rej", uid, pro: pro_rej })
				if (c && c > 0) usr(uid)
				else pro_rej_e.disabled = false
			})
			pro_ref_e.addEventListener("click", async () => {
				pro_ref_e.disabled = true
				const c = await pos<DocU>("pro", { re: "ref", uid, pro: pro_ref })
				if (c && c > 0) usr(uid)
				else pro_ref_e.disabled = false
			})
		}
	} else {
		pos_e.classList.add("none")
		pro_e.classList.add("none")
	}

	main.append(usr_t)
}

function usrput(
	u: NonNullable<Usr>
) {
	main.innerHTML = ""

	const [usrput_t, [
		idnam_e, id_e,
		nam_e, adm1_e, adm2_e, intro_e,
		put_e, cancel_e,
	]] = bind("usrput", [
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
		const c = await pos<DocU>("put", {
			uid: u._id,
			nam: nam_e.value,
			adm1: adm1_e.value,
			adm2: adm2_e.value,
			intro: intro_e.value.trim(),
		})
		if (c === null) { alert(`无效输入`); return }
		pas_a.innerText = nam_e.value
		usr(u._id)
	})
	cancel_e.addEventListener("click", () => usr(u._id))

	main.append(usrput_t)
}

function idnull(
	id: string,
) {
	main.innerHTML = ""

	const [idnull_t, [
		id_e, meta_e
	]] = bind("idnull", [
		"id", "meta"
	])
	id_e.innerText = id
	meta_e.innerText = `ismist.cn#${id} 是无效 id`;
	main.append(idnull_t)
}

window.addEventListener("hashchange", () => {
	hash = decodeURI(window.location.hash).substring(1)
	main.innerHTML = ""
	if (hash === "pas") paspre()
	else if (/^\d+$/.test(hash)) usr(parseInt(hash))
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
