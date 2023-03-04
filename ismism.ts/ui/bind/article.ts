import type { Id } from "../../src/eid/typ.ts"
import type { Pas, PasCode, PreUsr } from "../../src/pra/pos.ts"
import type * as Q from "../../src/pra/que.ts"
import { nav, navhash, navpas } from "./nav.ts"
import { bind, main, pos, que } from "./template.ts"
import { is_actid, is_nbr, req_re } from "../../src/eid/is.ts"
import { utc_medium } from "../../src/ont/utc.ts"
import { ida, idnam, meta, pro, rolref, seladm } from "./section.ts"
import { is_sec } from "../../src/pra/con.ts"

export function pas(
) {
	if (navhash("pas")) return
	if (nav.pas) {
		pos("pas", { uid: nav.pas.uid })
		navpas(null)
	}

	main.innerHTML = ""
	const t = bind("pas")

	const send = async () => {
		if (!is_nbr(t.nbr.value)) return alert("无效手机号")
		t.nbr.readOnly = t.send.disabled = true
		const sent = await pos<PasCode>("pas", { nbr: t.nbr.value, sms: location.hostname === "ismist.cn" })
		if (sent) {
			const utc = sent.utc ? `\n上次发送：${utc_medium(sent.utc)}` : ""
			t.hint.innerText = `验证码已发送，可多次使用\n一小时内不再重复发送${utc}`
			t.pas.classList.remove("none")
		} else {
			t.hint.innerText = `手机号未注册\n输入居住地与注册激活码\n激活码只能使用一次，确认手机号无误`
			seladm(t)
			t.adm.classList.remove("none")
			t.pre.classList.remove("none")
		}
	}
	t.send.addEventListener("click", send)

	t.act.addEventListener("click", async () => {
		if (!is_actid(t.actid.value)) return alert("无效激活码")
		t.actid.readOnly = t.act.disabled = t.adm1.disabled = t.adm2.disabled = true
		const uid = await pos<PreUsr>("pre", { actid: t.actid.value, nbr: t.nbr.value, adm1: t.adm1.value, adm2: t.adm2.value })
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
		navpas(p)
		usr(p.uid)
	})

	main.append(t.bind)

}

export type Usr = Omit<NonNullable<Q.Usr>, "unam" | "snam" | "anam"> & {
	unam: Map<Id["_id"], Id["nam"]>,
	snam: Map<Id["_id"], Id["nam"]>,
	anam: Map<Id["_id"], Id["nam"]>,
}
export async function usr(
	uid: number
) {
	if (navhash(`${uid}`)) return

	const q = await que<Q.Usr>(`usr?uid=${uid}`)
	if (!q) return idn(`${uid}`, "用户")
	const u: Usr = { ...q, unam: new Map(q.unam), snam: new Map(q.snam), anam: new Map(q.anam) }
	const [rej2, ref2] = [u.rej.length >= req_re, u.ref.length < req_re]
	const froze = rej2 && !(nav.pas && (nav.pas.aut || is_sec(nav.pas)))

	main.innerHTML = ""
	const t = bind("usr")

	const re = meta(t, u, rej2, ref2)
	idnam(t, `${uid}`, froze ? "" : u.nam, re)
	rolref(t.rolref, u)
	ida(t.uref, u.urej.map(r => [`${r}`, u.unam.get(r)!]))
	ida(t.uref, u.uref.map(r => [`${r}`, u.unam.get(r)!]))

	if (froze) [t.nam, t.intro, t.rec].forEach(el => el.classList.add("froze"))
	else {
		t.intro.innerText = u.intro
		t.rec.innerText = JSON.stringify(u.nrec)
	}

	if (nav.pas) {
		if (nav.pas.uid === uid) {
			t.put.addEventListener("click", () => put("用户", u))
			t.pas.addEventListener("click", pas)
			if (nav.pas.aut || is_sec(nav.pas)) {
				t.preusr.addEventListener("click", () => pre("用户"))
			} else t.preusr.remove()
			if (nav.pas.aut) {
				t.presoc.addEventListener("click", () => pre("社团"))
				t.preagd.addEventListener("click", () => pre("活动"))
			} else[t.presoc, t.preagd].forEach(p => p.remove())
			t.pro.remove()
		} else {
			t.pos.remove()
			t.pre.remove()
			if (nav.pas.aut || is_sec(nav.pas)) pro(t, u)
			else t.pro.remove()
		}
	} else {
		t.pos.remove()
		t.pre.remove()
		t.pro.remove()
	}

	main.append(t.bind)

}
export function soc(
	sid?: number
) {

}
export function agd(
	aid?: number
) {

}
export function wsl(
) {

}
export function lit(
) {

}
function pre(
	t: "用户" | "社团" | "活动",
) {

}
function put(
	t: "用户" | "社团" | "活动",
	id: Usr,
) {
}
export function idn(
	id: string, nam: string
) {
	main.innerHTML = ""

	const t = bind("idn")
	t.id.innerText = id
	t.meta.innerText = `ismist#${id} 是无效${nam}`

	main.append(t.bind)
}
