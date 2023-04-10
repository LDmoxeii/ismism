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

export type PosB = Record<string, string | number | boolean | Agd["img"] | Agd["goal"] | Rec["_id"]>
export async function pos<T>(
	p: Pos,
	b: PosB,
) {
	const res = await fetch(`/p/${p}`, {
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
		nrecday: t("section"), recwork: t("p"), recfund: t("p"),
	},

	wsllit: {
		wsllit: t("section"), prewsla: t("button"), prelita: t("button"), prewsl: t("button"), prelit: t("button"),
	},

	putrel: {
		putrel: t("section"), putsec: t("button"), putuid: t("button"), putresn: t("button"), putres: t("button"),
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
		pre: t("section"), preaud: t("button"), preaut: t("button"),
		preusr: t("button"), presoc: t("button"), preagd: t("button"), prefund: t("button"),
		...section.wsllit,
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
		ord: t("p"),
		...section.rec,
		pos: t("section"), put: t("button"),
		putord: t("button"), putimg: t("button"), putgoal: t("button"),
		prelive: t("button"), prevideo: t("button"), prework: t("button"),
		...section.putrel,
		...section.putpro,
	},

	goal: {
		tid: "goal" as const,
		circle: svg("circle"), pct: svg("text"), nam: t("span"),
	},

	nrecday: {
		tid: "nrecday" as const,
		nrecday: svg("svg"),
	},

	live: {
		tid: "live" as const,
		live: t("p"), livep: t("p"),
	},

	rec: {
		tid: "rec" as const, rec: t("article"),
		unam: t("a"), anam: t("a"),
		meta: t("section"),
		msg: t("section"),
		re: t("section"), rej: t("span"), ref: t("span"),
		...section.putpro, put: t("button"),
	},

	aut: {
		tid: "aut" as const,
		sup: t("p"), aud: t("p"), aut: t("p"), wsl: t("p"), lit: t("p"),
	},

	md: {
		tid: "md" as const,
		...section.idnam,
		utc: t("span"), utcp: t("span"), unam: t("span"),
		md: t("section"),
		put: t("button"), putpin: t("button"),
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
		p1: t("input"), p2: t("input"), p3: t("input"), p4: t("input"), pa: t("textarea"),
		putn: t("button"), put: t("button"), cancel: t("button"),
	},

	putid: {
		tid: "putid" as const,
		...section.idnam,
		meta: t("section"),
		pnam: t("input"),
		...section.seladm,
		intro: t("textarea"),
		uidlim: t("input"), reslim: t("input"),
		account: t("input"), budget: t("input"), fund: t("input"), expense: t("input"),
		putn: t("button"), put: t("button"), cancel: t("button"),
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
