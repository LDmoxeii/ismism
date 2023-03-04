import { Pos } from "../../src/pra/pos.ts"

export const utc_refresh = 500
export let utc_etag = Date.now()
export const main = document.getElementById("main")! as HTMLDivElement
export const pas_a = document.getElementById("pas_a")! as HTMLAnchorElement

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
	b: Record<string, string | number | boolean>,
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

	pro: {
		pro: t("section"), prorej: t("button"), proref: t("button"),
	},

	seladm: {
		adm: t("section"), adm1: t("select"), adm2: t("select"),
	}
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
		rolref: t("p"), urej: t("span"), uref: t("span"), intro: t("p"), rec: t("p"),
		pos: t("section"), put: t("button"), pas: t("button"),
		pre: t("section"), preusr: t("button"), presoc: t("button"), preagd: t("button"), prefund: t("button"),
		...section.pro,
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
