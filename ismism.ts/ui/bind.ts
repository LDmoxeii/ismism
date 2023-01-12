// deno-lint-ignore-file no-window-prefix
import { utc_medium } from "../src/ontic/utc.ts"
import { User } from "../src/query.ts"
import type { UserPass } from "../src/query/user.ts"

const ver = "ismism-0.0.3-20230112"
let hash = ""
const main = document.getElementById("main")!
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

async function login(
) {
	userpass = null
	const [login_t, [
		nbr_e, send_e, code_e, issue_e
	]] = template("login", ["nbr", "send", "code", "issue"]) as [DocumentFragment, [
		HTMLInputElement, HTMLButtonElement, HTMLInputElement, HTMLButtonElement
	]]
	send_e.addEventListener("click", () => {
		if (!nbr_e.checkValidity()) { alert("无效手机号"); return }
		nbr_e.readOnly = send_e.disabled = true
		send_e.innerText = "已发送"
		post("userpass_code", { nbr: nbr_e.value, code: 0, sms: true }).then(console.log)
		code_e.readOnly = issue_e.disabled = false
	})
	issue_e.addEventListener("click", () => {
		if (!code_e.checkValidity()) { alert("无效验证码"); return }
		code_e.readOnly = issue_e.disabled = true
		post("userpass_issue", { nbr: nbr_e.value, code: parseInt(code_e.value), renew: true }).then(u => {
			userpass = u as UserPass
			window.location.hash = `#${userpass.uid}`
			console.log(userpass)
		})
	})
	main.appendChild(login_t)
}

async function user(
	uid: number
) {
	const u = uid > 0 ? await query(`user?uid=${uid}`) as User : null
	if (!u) {
		const [user_t, [id_e]] = template("user-0", ["id"])
		id_e.innerText = `${uid}`
		main.appendChild(user_t)
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
		quit_e.addEventListener("click", () => alert("quit"))
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
	main.appendChild(user_t)
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
	console.log(userpass)
	window.dispatchEvent(new Event("hashchange"))
}
load()
