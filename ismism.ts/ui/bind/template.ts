export async function que<T>(
	q: string
) {
	const res = await fetch(`/q/${q}`)
	const etag = res.headers.get("etag")?.substring(3)
	if (etag) utc_etag = parseInt(etag)
	return res.json() as T
}

export async function pos<T>(
	f: string, b: Record<string, string | number | boolean>
) {
	const res = await fetch(`/p/${f}`, {
		method: "POST",
		body: JSON.stringify(b)
	})
	return res.json() as T
}

export let utc_etag = Date.now()
export const main = document.getElementById("main")!
export const pas_a = document.getElementById("pas")! as HTMLAnchorElement

const t: typeof document.createElement = (s: string) => document.createElement(s)

const template = {
	pasact: {
		nbr: t("input"), send: t("button"),
		adm: t("section"), adm1: t("select"), adm2: t("select"),
		pre: t("section"), actid: t("input"), act: t("button"),
		pas: t("section"), code: t("input"), issue: t("button"),
		hint: t("section"),
	},

	usr: {
		idnam: t("a"), id: t("code"), nam: t("span"),
		adm: t("span"), utc: t("span"),
		rej: t("span"), ref: t("span"),
		rejc: t("span"), refc: t("span"), proc: t("span"),
		intro: t("p"),
		soc: t("p"),
		rec: t("section"),
		pos: t("section"), put: t("button"), pas: t("button"),
		pre: t("section"), preusr: t("button"), presoc: t("button"), preagd: t("button"),
		pro: t("section"), prorej: t("button"), proref: t("button"),
	},

	soc: {
		idnam: t("a"), id: t("code"), nam: t("span"),
		adm: t("span"), utc: t("span"),
		rej: t("span"), ref: t("span"),
		rejc: t("span"), refc: t("span"), proc: t("span"),
		sec: t("section"), uid: t("p"), res: t("p"), intro: t("p"), rec: t("p"),
		put: t("section"), putpre: t("button"), putsec: t("button"), putuid: t("button"), putres: t("button"),
		pro: t("section"), prorej: t("button"), proref: t("button"),
	},

	pre: {
		idnam: t("a"), id: t("code"), nam: t("span"),
		meta: t("section"), pnam: t("input"), nbr: t("input"),
		adm: t("section"), adm1: t("select"), adm2: t("select"),
		intro: t("textarea"),
		pre: t("button"), cancel: t("button"),
	},

	putusr: {
		idnam: t("a"), id: t("code"),
		nam: t("input"),
		adm1: t("select"), adm2: t("select"),
		intro: t("textarea"),
		put: t("button"), cancel: t("button"),
	},

	idnull: {
		id: t("cod"),
		meta: t("section")
	}
}
export type Template = typeof template

export function bind<
	T extends keyof Template
>(
	tid: T
): Template[T] & { bind: DocumentFragment } {
	const temp = document.getElementById(tid) as HTMLTemplateElement
	const t = temp.content.cloneNode(true) as DocumentFragment
	const b = Object.fromEntries([
		["bind", t], ...Object.keys(template[tid]).map(c => [
			c, t.querySelector(`.${c}`) as HTMLElement
		])
	]) as Template[T] & { bind: DocumentFragment }
	return b
}
