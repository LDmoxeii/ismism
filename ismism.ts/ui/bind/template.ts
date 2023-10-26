import type { Pas } from "../../src/pra/pos.ts"

const pas_a = document.getElementById("pas")! as HTMLAnchorElement

export function pas(
	p?: Pas | null
) {
	if (p) {
		pas_a.innerText = p.nam
		pas_a.href = `#${p.usr}`
	} else {
		pas_a.innerText = "用户登录"
		pas_a.href = "#psg"
	}
}

const tag: typeof document.createElement = (s: string) => document.createElement(s)
const template = {
	id: { idnam: tag("a"), id: tag("code"), nam: tag("span"), mta: tag("p"), msg: tag("p") },
	lp: { lp: tag("p") },
	sms: { nbr: tag("input"), sms: tag("button"), hint: tag("p") },
	code: { code: tag("input"), send: tag("button") },
	put_s: { str: tag("input") },
	put_adm: { adm1: tag("select"), adm2: tag("select") },
	put_t: { txt: tag("textarea") },
	btn_usr: { put: tag("button"), clr: tag("button") },
	btn_pos: { del: tag("button"), put: tag("button"), ret: tag("button") },
	btn_aut: { aut: tag("button"), usr: tag("button"), soc: tag("button") },
	btn_soc: { aut: tag("button"), msg: tag("button"), agr: tag("button"), agd: tag("button"), cdt: tag("button"), dbt: tag("button"), ern: tag("button") },
	btn_agd: { put: tag("button") },
	btn_msg: { pre: tag("button"), put: tag("button"), pin: tag("button") },
}
type Template = typeof template

export type Bind = DocumentFragment
export type Section<
	T extends keyof Template
> = { bind: Bind } & Template[T]

export function section<
	T extends keyof Template
>(
	tid: T
): Section<T> {
	const temp = document.getElementById(tid) as HTMLTemplateElement
	const t = temp.content.cloneNode(true) as DocumentFragment
	return Object.fromEntries([["bind", t], ...Object.keys(template[tid]).map(c =>
		[c, t.querySelector(`.${c}`)])
	]) as Section<T>
}

const main = document.getElementById("main")! as HTMLDivElement

export function article(
	...bs: Bind[]
): HTMLElement {
	main.innerHTML = ""
	const a = main.appendChild(document.createElement("article"))
	if (bs.length > 0) a.append(...bs)
	return a
}
