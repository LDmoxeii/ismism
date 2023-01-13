// deno-lint-ignore-file no-window-prefix
import { utc_medium } from "../src/ontic/utc.ts"
import { User, UserPassCode } from "../src/query.ts"
import type { UserPass } from "../src/query/user.ts"

const ver = "ismism-0.0.3-20230112"
let hash = ""
const main_e = document.getElementById("main")!
const userpass_e = document.getElementById("userpass")!
let utc_etag = Date.now()
let userpass: UserPass | null = null

async function query<T>(
	q: string
) {
	const res = await fetch(`/q/${q}`)
	const etag = res.headers.get("etag")?.substring(3)
	if (etag) utc_etag = parseInt(etag)
	return res.json() as T
}

async function post<T>(
	f: string, b: Record<string, string | number | boolean>
) {
	const res = await fetch(`/p/${f}`, {
		method: "POST",
		body: JSON.stringify(b)
	})
	return res.json() as T
}

function template(
	tid: string,
	elc: string[]
): [DocumentFragment, HTMLElement[]] {
	const temp = document.getElementById(tid) as HTMLTemplateElement
	const t = temp.content.cloneNode(true) as DocumentFragment
	return [t, elc.map(c => t.querySelector(`.${c}`)!)]
}

function login(
) {
	userpass = null
	const [login_t, [
		nbr_e, send_e,
		usernew_e, act_e, activate_e,
		codeissue_e, code_e, issue_e,
		hint_e,
	]] = template("login", [
		"nbr", "send",
		"usernew", "act", "activate",
		"codeissue", "code", "issue",
		"hint",
	]) as [DocumentFragment, [
		HTMLInputElement, HTMLButtonElement,
		HTMLElement, HTMLInputElement, HTMLButtonElement,
		HTMLElement, HTMLInputElement, HTMLButtonElement,
		HTMLElement,
	]]
	const send = async () => {
		if (!nbr_e.checkValidity()) { alert("无效手机号"); return }
		nbr_e.readOnly = send_e.disabled = true
		const sent = await post("userpass_code", { nbr: nbr_e.value, code: 0, sms: true }) as UserPassCode
		if (sent) {
			const utc = sent.utc ? `上次发送：${utc_medium(sent.utc)}` : ""
			hint_e.innerText = `验证码已发送，可多次使用\n一小时内不再重复发送${utc}`
			codeissue_e.classList.remove("none")
		} else {
			hint_e.innerText = `手机号未注册\n输入注册激活码\n激活码只能使用一次，确认手机号无误`
			usernew_e.classList.remove("none")
		}
	}
	send_e.addEventListener("click", send)
	activate_e.addEventListener("click", () => {
		act_e.readOnly = activate_e.disabled = true
		const activated = true
		if (activated) codeissue_e.classList.remove("none") //send()
		else {
			act_e.readOnly = activate_e.disabled = false
			alert("无效激活码")
		}
	})
	issue_e.addEventListener("click", () => {
		if (!code_e.checkValidity()) { alert("无效验证码"); return }
		code_e.readOnly = issue_e.disabled = true
		post("userpass_issue", { nbr: nbr_e.value, code: parseInt(code_e.value), renew: true }).then(u => {
			userpass = u as UserPass
			userpass_e.innerText = `用户#${userpass.uid}`
			window.location.hash = `#${userpass.uid}`
		})
	})
	main_e.appendChild(login_t)
}

async function user(
	uid: number
) {
	const u = uid > 0 ? await query(`user?uid=${uid}`) as User : null
	if (!u) {
		const [user_t, [id_e]] = template("user-0", ["id"])
		id_e.innerText = `${uid}`
		main_e.appendChild(user_t)
		return
	}
	const uname = new Map(u.uname)
	const [user_t, [
		idname_e, id_e, name_e, eidt_e, quit_e, meta_e, intro_e, soc_e,
	]] = template("user", ["idname", "id", "name", "edit", "quit", "meta", "intro", "soc"])
	if (idname_e instanceof HTMLAnchorElement) idname_e.href = `#${uid}`
	id_e.innerText = `${uid}`
	name_e.innerText = u.name
	if (userpass && userpass.uid == uid) {
		eidt_e.addEventListener("click", () => alert("edit"))
		quit_e.addEventListener("click", () => {
			post("userpass_clear", {}).then(() => {
				userpass = null
				userpass_e.innerText = "用户登录"
				window.location.hash = "#u"
			})
		})
		eidt_e.classList.remove("none")
		quit_e.classList.remove("none")
	}
	meta_e.innerText = `注册时间：${utc_medium(u.utc)}\n推荐人：${u.referer.length == 0 ? "无" : ""}`
	u.referer.forEach((r, n) => {
		const a = meta_e.appendChild(document.createElement("a"))
		a.href = `#${r}`
		a.innerText = uname.get(r) ?? `${r}`
		if (n > 0) a.classList.add("sep")
	})
	intro_e.innerText = u.intro
	soc_e.innerText = `所属社团：${u.referer.length == 0 ? "无" : ""}`
	u.soc.forEach((s, n) => {
		const a = soc_e.appendChild(document.createElement("a"))
		a.href = `#s${s._id}`
		a.innerText = s.name
		if (n > 0) a.classList.add("sep")
	})
	main_e.appendChild(user_t)
}

window.addEventListener("hashchange", () => {
	hash = decodeURI(window.location.hash).substring(1)
	switch (hash[0]) {
		case undefined: { break }
		case "u": {
			if (userpass) window.location.hash = `#${userpass.uid}`
			else login()
			break
		} default: { user(parseInt(hash)); break }
	}
})

async function load(
) {
	console.log(`\n主义主义开发小组！成员招募中！\n\n发送自我介绍至网站维护邮箱，或微信联系 728 万大可\n \n`)
	console.log(ver)
	userpass = await post("userpass", {})
	if (userpass?.uid) userpass_e.innerText = `用户#${userpass.uid}`
	window.dispatchEvent(new Event("hashchange"))
}
load()
