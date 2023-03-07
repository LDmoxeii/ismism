import type { Rec } from "../../src/eid/typ.ts"
import type { Pos } from "../../src/pra/pos.ts"
import type { Agd } from "./article.ts"

export const utc_refresh = 750
export let utc_etag = Date.now()
export const main = document.getElementById("main")! as HTMLDivElement
export const pas_a = document.getElementById("pas_a")! as HTMLAnchorElement
export const adm1 = document.getElementById("adm1")! as HTMLMenuElement
export const adm2 = document.getElementById("adm2")! as HTMLMenuElement

export async function que<T>(
	q: string
) {
	const r = await fetch(`/q/${q}`)
	const etag = r.headers.get("etag")?.substring(3)
	if (etag) utc_etag = parseInt(etag)
	return r.json() as T
}

export async function pos<T>(
	f: Pos,
	b: Record<string, string | number | boolean | Agd["img"] | Agd["goal"] | Rec["_id"]>,
) {
	const res = await fetch(`/p/${f}`, {
		method: "POST",
		body: JSON.stringify(b)
	})
	return res.json() as T
}

const t: typeof document.createElement = (s: string) => document.createElement(s)
const svg = <S extends keyof SVGElementTagNameMap>(s: S) => document.createElementNS("http://www.w3.org/2000/svg", s)

const section = {
	idnam: {
		idnam: t("a"), id: t("code"), nam: t("span"),
	},

	meta: {
		adm: t("span"), utc: t("span"),
		rej: t("span"), ref: t("span"),
		rej2: t("em"), ref2: t("em"),
	},

	seladm: {
		adm: t("section"), adm1: t("select"), adm2: t("select"),
	},

	re: {
		urej: t("p"), uref: t("p"),
	},

	rel: {
		sec: t("p"), uid: t("p"), res: t("p"),
	},

	cover: {
		cover: t("section"),
		imgn: t("div"), prev: t("button"), next: t("button"),
		imgnam: t("div"), img: t("img"),
	},

	acct: {
		fundbar: svg("rect"), expensebar: svg("rect"),
		fund: svg("text"), fundpct: svg("text"), budget: svg("text"),
		expense: svg("text"), expensepct: svg("text"),
		account: t("a"),
	},

	rec: {
		recwork: t("p"), recfund: t("p"),
	},

	putrel: {
		putrel: t("section"), putsec: t("button"), putuid: t("button"), putres: t("button"),
	},

	putpro: {
		putpro: t("section"), putrej: t("button"), putref: t("button"),
	},
}
export type Section = typeof section

const template = {
	pas: {
		tid: "pas" as const,
		nbr: t("input"), send: t("button"),
		...section.seladm,
		pre: t("section"), actid: t("input"), act: t("button"),
		pas: t("section"), code: t("input"), issue: t("button"),
		hint: t("section"),
	},

	usr: {
		tid: "usr" as const,
		...section.idnam,
		...section.meta,
		rolref: t("p"),
		...section.re,
		intro: t("p"),
		...section.rec,
		pos: t("section"), put: t("button"), pas: t("button"),
		pre: t("section"), preusr: t("button"), presoc: t("button"), preagd: t("button"), prefund: t("button"),
		...section.putpro,
	},

	soc: {
		tid: "soc" as const,
		...section.idnam,
		...section.meta,
		...section.rel,
		intro: t("p"),
		...section.rec,
		pos: t("section"), put: t("button"),
		...section.putrel,
		...section.putpro,
	},

	agd: {
		tid: "agd" as const,
		...section.idnam,
		...section.meta,
		...section.cover,
		...section.acct,
		goal: t("p"), intro: t("p"),
		...section.rel,
		...section.rec,
		pos: t("section"), put: t("button"), putimg: t("button"), putgoal: t("button"), prework: t("button"), prevideo: t("button"),
		...section.putrel,
		...section.putpro,
	},

	goal: {
		tid: "goal" as const,
		circle: svg("circle"), pct: svg("text"), nam: t("span"),
	},

	rec: {
		tid: "rec" as const,
		unam: t("a"), anam: t("a"),
		meta: t("section"),
		msg: t("section"),
		re: t("section"), rej: t("span"), ref: t("span"),
		...section.putpro, put: t("button"),
	},

	pre: {
		tid: "pre" as const,
		...section.idnam,
		nbr: t("input"), pnam: t("input"),
		...section.seladm,
		pre: t("button"), cancel: t("button"),
	},

	put: {
		tid: "put" as const,
		...section.idnam,
		meta: t("section"),
		pnam: t("input"),
		...section.seladm,
		intro: t("textarea"),
		uidlim: t("input"), reslim: t("input"),
		account: t("input"), budget: t("input"), fund: t("input"), expense: t("input"),
		put: t("button"), cancel: t("button"),
	},

	idn: {
		tid: "idn" as const,
		id: t("code"), meta: t("section"),
	}
}
type Template = typeof template

export type Bind<
	T extends keyof Template
> = {
	bind: DocumentFragment
} & Template[T]

export function bind<
	T extends keyof Template
>(
	tid: T
): Bind<T> {
	const temp = document.getElementById(tid) as HTMLTemplateElement
	const t = temp.content.cloneNode(true) as DocumentFragment
	const b = Object.fromEntries([
		["bind", t], ...Object.keys(template[tid]).map(c => [
			c, t.querySelector(`.${c}`) as HTMLElement
		])
	]) as Bind<T>
	b.tid = tid
	return b
}
