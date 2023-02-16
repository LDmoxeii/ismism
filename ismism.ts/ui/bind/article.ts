// deno-lint-ignore-file no-window-prefix
import type { DocC } from "../../src/db.ts"
import type { Id } from "../../src/eid/typ.ts"
import { utc_medium } from "../../src/ont/utc.ts"
import type { Pas } from "../../src/pra/pas.ts"
import type { PasCode, UsrAct } from "../../src/pra/pos.ts"
import type * as Q from "../../src/pra/que.ts"
import { admsel, idnam, ida, idmeta, pro, label, btn, txt } from "./section.ts"
import { bind, main, pas_a, pos, que } from "./template.ts"
import { not_aut, not_pro } from "../../src/pra/con.ts"
import { not_actid, not_nbr } from "../../src/eid/is.ts"

export let hash = ""
let pas: Pas | null = null

function hashchange(
	h: string
): boolean {
	if (hash === h || hash === "" && h === "agd") return false
	location.href = `#${h}`
	return true
}

function pasact(
) {
	if (hashchange("pas")) return

	if (pas) pos("pas", { uid: pas.id.uid })
	pas = null
	pas_a.innerText = "用户登录"
	pas_a.href = "#pas"

	main.innerHTML = ""
	const t = bind("pasact")

	const send = async () => {
		if (not_nbr(t.nbr.value)) return alert("无效手机号")
		t.nbr.readOnly = t.send.disabled = true
		const sent = await pos<PasCode>("pas", { nbr: t.nbr.value, sms: location.hostname === "ismist.cn" })
		if (sent) {
			const utc = sent.utc ? `\n上次发送：${utc_medium(sent.utc)}` : ""
			t.hint.innerText = `验证码已发送，可多次使用\n一小时内不再重复发送${utc}`
			t.pas.classList.remove("none")
		} else {
			t.hint.innerText = `手机号未注册\n输入居住地与注册激活码\n激活码只能使用一次，确认手机号无误`
			admsel(t)
			t.adm.classList.remove("none")
			t.pre.classList.remove("none")
		}
	}
	t.send.addEventListener("click", send)

	t.act.addEventListener("click", async () => {
		if (not_actid(t.actid.value)) return alert("无效激活码")
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

	t.issue.addEventListener("click", async () => {
		if (!t.code.checkValidity()) return alert("无效验证码")
		t.code.readOnly = t.issue.disabled = true
		const p = await pos<Pas>("pas", { nbr: t.nbr.value, code: parseInt(t.code.value) })
		if (!p) {
			t.code.readOnly = t.issue.disabled = false
			return alert("无效验证码")
		}
		pas = p
		pas_a.innerText = p.nam
		pas_a.href = `#${p.id.uid}`
		usr(p.id.uid)
	})

	main.append(t.bind)
}

export type Usr = Omit<NonNullable<Q.Usr>, "unam" | "snam"> & {
	unam: Map<Id["_id"], Id["nam"]>,
	snam: Map<Id["_id"], Id["nam"]>,
}

async function usr(
	uid: Usr["_id"],
) {
	if (hashchange(`${uid}`)) return

	const q = await que<Q.Usr>(`usr?uid=${uid}`)
	if (!q) return idnull(`${uid}`, "用户")
	const u: Usr = { ...q, unam: new Map(q.unam), snam: new Map(q.snam) }

	main.innerHTML = ""
	const t = bind("usr")

	const pub = idmeta(pas, t, u)
	idnam(t, `${uid}`, pub ? u.nam : "-冻结中-")

	if (pub) {
		t.intro.innerText = u.intro.length > 0 ? u.intro : "无"
		ida(t.soc, "s", u.snam)
		t.rec.innerText = JSON.stringify(u.nrec)
	} else t.intro.innerText = t.soc.innerText = t.rec.innerText = "-冻结中-"

	if (pas) {
		if (pas.id.uid === uid) {
			t.put.addEventListener("click", () => putusr(u))
			t.pas.addEventListener("click", () => pasact())
			if (not_aut(pas.aut, "pre_usr")) t.preusr.remove()
			else t.preusr.addEventListener("click", () => pre("创建用户"))
			if (not_aut(pas.aut, "pre_soc")) t.presoc.remove()
			else t.presoc.addEventListener("click", () => pre("创建社团"))
			if (not_aut(pas.aut, "pre_agd")) t.preagd.remove()
			else t.preagd.addEventListener("click", () => pre("创建活动"))
			t.pro.remove()
		} else {
			t.pos.remove()
			t.pre.remove()
			if (not_aut(pas.aut, "pre_usr") || not_pro(pas) || pas.ref.includes(uid))
				pro(pas, t, u)
			else pro(pas, t, u, () => usr(u._id))
		}
	} else {
		t.pos.remove()
		t.pre.remove()
		t.pro.remove()
	}

	main.append(t.bind)
}

export type Soc = Omit<NonNullable<Q.Soc>, "unam"> & {
	unam: Map<Id["_id"], Id["nam"]>,
}

async function soc(
	sid?: Soc["_id"]
) {
	if (hashchange(`s${sid ?? "oc"}`)) return

	let ss = sid ? [await que<Q.Soc>(`soc?sid=${sid}`)] : await que<Q.Soc[]>("soc")
	ss = ss.filter(s => s)
	if (sid && ss.length === 0) return idnull(`s${sid}`, "社团")

	main.innerHTML = ""

	for (const d of ss) {
		if (!d) continue

		const t = bind("soc")
		const s = { ...d, unam: new Map(d.unam) }

		const pub = idmeta(pas, t, s)
		idnam(t, `s${s._id}`, s.nam)

		ida(t.sec, "", s.unam, s.sec)
		ida(t.uid, "", s.unam, s.uid)
		label(t.res, `申请加入（${s.res.length}/${s.res_max}）：`)
		ida(t.res, "", s.unam, s.res)

		if (pub) {
			t.intro.innerText = s.intro
			t.rec.innerText = JSON.stringify(s.nrec)
		} else t.sec.innerText = t.uid.innerText = t.res.innerText = t.intro.innerText = t.rec.innerText = "-冻结中-"

		if (pas) {
			if (not_aut(pas.aut, "pre_soc")) t.putpre.remove()
			else t.putpre.disabled = true
			if (!s.sec.includes(pas.id.uid)) t.putsec.remove()
			else t.putsec.disabled = true
			if (!s.uid.includes(pas.id.uid)) t.putuid.remove()
			else btn(t.putuid, t.putuid.innerText, {
				confirm: "退出社团？",
				pos: () => pos("put", { sid: s._id, uid: pas!.id.uid, pro: false }),
				refresh: () => soc(s._id),
			})
			if (s.uid.includes(pas.id.uid)) t.putres.remove()
			else {
				const res = !s.res.includes(pas.id.uid)
				btn(t.putres, res ? "申请加入" : "取消申请", !res || pub && s.res.length < s.res_max ? {
					pos: () => pos("put", { sid: s._id, res }), refresh: () => soc(s._id)
				} : undefined)
			}
			if (not_aut(pas.aut, "pre_soc") || not_pro(pas)) pro(pas, t, s)
			else pro(pas, t, s, () => soc(s._id))
		} else {
			t.put.remove()
			t.pro.remove()
		}

		main.append(t.bind)
	}
}

export type Agd = Omit<NonNullable<Q.Agd>, "unam"> & {
	unam: Map<Id["_id"], Id["nam"]>,
}

async function agd(
	aid?: Agd["_id"]
) {
	if (hashchange(`a${aid ?? "gd"}`)) return

	let aa = aid ? [await que<Q.Agd>(`agd?aid=${aid}`)] : await que<Q.Agd[]>("agd")
	aa = aa.filter(a => a)
	if (aid && aa.length === 0) return idnull(`a${aid}`, "活动")

	main.innerText = JSON.stringify(aa, null, 2)
}

function pre(
	nam: "创建用户" | "创建社团" | "创建活动"
) {
	if (!pas || hashchange(`${pas.id.uid}`)) return

	main.innerHTML = ""
	const t = bind("pre")

	idnam(t, `${pas.id.uid}`, nam)
	t.meta.innerText = `将作为推荐人${nam}`
	admsel(t)

	switch (nam) {
		case "创建用户": {
			t.meta.innerText += `\n新用户可通过手机号登录、编辑用户信息`
			t.pnam.parentElement?.remove()
			t.intro.parentElement?.remove()
			break
		} case "创建社团": case "创建活动": {
			t.nbr.parentElement?.remove()
			txt(t.intro, "简介")
			break
		} default: { usr(pas.id.uid); return }
	}
	const { p, f } = {
		p: () => ({
			nbr: t.nbr.value, adm1: t.adm1.value, adm2: t.adm2.value
		}), f: usr,
		...nam === "创建社团" ? {
			p: () => ({
				snam: t.pnam.value, adm1: t.adm1.value, adm2: t.adm2.value, intro: t.intro.value
			}), f: soc,
		} : {},
		...nam === "创建活动" ? {
			p: () => ({
				anam: t.pnam.value, adm1: t.adm1.value, adm2: t.adm2.value, intro: t.intro.value
			}), f: agd,
		} : {},
	}
	btn(t.pre, t.pre.innerText, {
		pos: () => pos<DocC<Id["_id"]>>("pre", p()),
		alert: `无效输入\n或${nam === "创建用户" ? "手机号" : "名称"}已注册`,
		refresh: f,
	})
	t.cancel.addEventListener("click", () => usr(pas!.id.uid))

	main.append(t.bind)
}

function putusr(
	u: Usr
) {
	main.innerHTML = ""
	const t = bind("putusr")

	idnam(t, `${u._id}`, u.nam)
	admsel(t, u.adm1, u.adm2)
	txt(t.intro, "简介", u.intro)
	btn(t.put, t.put.innerText, {
		pos: () => pos("put", {
			uid: u._id,
			nam: t.nam.value,
			adm1: t.adm1.value,
			adm2: t.adm2.value,
			intro: t.intro.value.trim(),
		}),
		alert: "无效输入\n或名称已被占用",
		refresh: () => { pas_a.innerText = t.nam.value; usr(u._id) },
	})
	t.cancel.addEventListener("click", () => usr(u._id))

	main.append(t.bind)
}

function idnull(
	id: string,
	nam: string,
) {
	main.innerHTML = ""

	const t = bind("idnull")
	t.id.innerText = id
	t.meta.innerText = `ismist#${id} 是无效${nam}`

	main.append(t.bind)
}

window.addEventListener("hashchange", () => {
	hash = decodeURI(location.hash).substring(1)
	if (hash === "pas") pasact()
	else if (/^\d+$/.test(hash)) usr(parseInt(hash))
	else if (hash === "soc") soc()
	else if (/^s\d+$/.test(hash)) soc(parseInt(hash.substring(1)))
	else if (hash === "" || hash === "agd") agd()
	else if (/^a\d+$/.test(hash)) agd(parseInt(hash.substring(1)))
	else idnull(hash, "链接")
})

export async function load(
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
