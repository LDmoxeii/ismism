export async function que<T>(
	q: string
) {
	const r = await fetch(`/q/${q}`)
	const etag = r.headers.get("etag")?.substring(3)
	if (etag) utc_etag = parseInt(etag)
	return r.json() as T
}

export async function pos<T>(
	f: string,
	b: Record<string, string | number | boolean>,
) {
	const res = await fetch(`/p/${f}`, {
		method: "POST",
		body: JSON.stringify(b)
	})
	return res.json() as T
}

export const utc_refresh = 500
export let utc_etag = Date.now()
export const main = document.getElementById("main")! as HTMLDivElement
export const pas_a = document.getElementById("pas")! as HTMLAnchorElement

const t: typeof document.createElement = (s: string) => document.createElement(s)
const svg = <S extends keyof SVGElementTagNameMap>(s: S) => document.createElementNS("http://www.w3.org/2000/svg", s)

const template = {
	pasact: {
		tid: "pasact" as const,
		nbr: t("input"), send: t("button"),
		adm: t("section"), adm1: t("select"), adm2: t("select"),
		pre: t("section"), actid: t("input"), act: t("button"),
		pas: t("section"), code: t("input"), issue: t("button"),
		hint: t("section"),
	},

	usr: {
		tid: "usr" as const,
		idnam: t("a"), id: t("code"), nam: t("span"),
		adm: t("span"), utc: t("span"),
		rej: t("span"), ref: t("span"),
		rejc: t("span"), refc: t("span"), proc: t("span"),
		intro: t("p"), soc: t("p"), rec: t("p"),
		pos: t("section"), put: t("button"), pas: t("button"),
		pre: t("section"), preusr: t("button"), presoc: t("button"), preagd: t("button"),
		pro: t("section"), prorej: t("button"), proref: t("button"),
	},

	soc: {
		tid: "soc" as const,
		idnam: t("a"), id: t("code"), nam: t("span"),
		adm: t("span"), utc: t("span"),
		rej: t("span"), ref: t("span"),
		rejc: t("span"), refc: t("span"), proc: t("span"),
		sec: t("p"), uid: t("p"), res: t("p"), intro: t("p"), rec: t("p"),
		put: t("section"), putpre: t("button"), putsec: t("button"), putuid: t("button"), putres: t("button"),
		pro: t("section"), prorej: t("button"), proref: t("button"),
	},

	goal: {
		tid: "goal" as const,
		circle: svg("circle"), pct: svg("text"), nam: t("span"),
	},

	agd: {
		tid: "agd" as const,
		idnam: t("a"), id: t("code"), nam: t("span"),
		adm: t("span"), utc: t("span"),
		rej: t("span"), ref: t("span"),
		rejc: t("span"), refc: t("span"), proc: t("span"),
		fundbar: svg("rect"), expensebar: svg("rect"),
		fund: svg("text"), fundpct: svg("text"), budget: svg("text"),
		expense: svg("text"), expensepct: svg("text"),
		detail: t("a"),
		goal: t("p"), intro: t("p"), rec: t("p"),
		pro: t("section"), prorej: t("button"), proref: t("button"),
		put: t("section"), putgoal: t("button"),
	},

	pre: {
		tid: "pre" as const,
		idnam: t("a"), id: t("code"), nam: t("span"),
		meta: t("section"), pnam: t("input"), nbr: t("input"),
		adm: t("section"), adm1: t("select"), adm2: t("select"),
		intro: t("textarea"),
		pre: t("button"), cancel: t("button"),
	},

	put: {
		tid: "put" as const,
		idnam: t("a"), id: t("code"), nam: t("span"),
		pnam: t("input"), adm1: t("select"), adm2: t("select"), intro: t("textarea"),
		resmax: t("input"), detail: t("input"),
		put: t("button"), cancel: t("button"),
	},

	idnull: {
		tid: "idnull" as const,
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
	b.tid = tid
	return b
}
