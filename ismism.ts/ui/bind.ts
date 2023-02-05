// deno-lint-ignore-file no-window-prefix
import { adm } from "../src/ont/adm.ts"
import { utc_medium } from "../src/ont/utc.ts"
import type { Pas } from "../src/pra/pas.ts"
import type { PasCode, UsrAct } from "../src/pra/pos.ts"

function bind(
	tid: string,
	ecl: string[],
): [DocumentFragment, HTMLElement[]] {
	const temp = document.getElementById(tid) as HTMLTemplateElement
	const t = temp.content.cloneNode(true) as DocumentFragment
	return [t, ecl.map(c => t.querySelector(`.${c}`)!)]
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

let hash = ""
let pas: Pas | null = null
const main = document.getElementById("main")!

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
			pas = p
			const pas_a = document.getElementById("pas")! as HTMLAnchorElement
			pas_a.innerText = p.nam
			pas_a.href = `#${p.id.uid}`
			window.location.hash = `#${p.id.uid}`
		})
	})

	main.append(paspre_t)
}

window.addEventListener("hashchange", () => {
	hash = decodeURI(window.location.hash).substring(1)
	main.innerHTML = ""
	if (hash === "pas") paspre()
	else if (/^\d+$/.test(hash)) main.innerText = JSON.stringify(pas, null, 2)
})

async function load(
) {
	console.log("ismism-20230204")
	console.log(`\n主义主义开发小组！成员招募中！\n\n发送自我介绍至网站维护邮箱，或微信联系 728 万大可\n \n`)
	pas = await pos<Pas>("pas", {})
	if (pas) {
		const pas_a = document.getElementById("pas")! as HTMLAnchorElement
		pas_a.innerText = pas.nam
		pas_a.href = `#${pas.id.uid}`
	}
	window.dispatchEvent(new Event("hashchange"))
}
load()



