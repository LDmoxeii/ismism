export const utc_refresh = 750
export const main = document.getElementById("main")! as HTMLDivElement
export const agd_a = document.getElementById("agd_a")! as HTMLAnchorElement
export const soc_a = document.getElementById("soc_a")! as HTMLAnchorElement
export const pas_a = document.getElementById("pas_a")! as HTMLAnchorElement
export const adm1 = document.getElementById("adm1")! as HTMLMenuElement
export const adm2 = document.getElementById("adm2")! as HTMLMenuElement

export const claim = `称谓解释：
鉴于部分参与者尚未完成公司、个体户注册，本比赛以工益互助组，工益组，工益小组等称谓对各参赛单元进行划分。该分组方式目的在于便于进行区分各参赛单元。如各小组筹备注册完成，应更改或标注经营主体名称。
各参赛单元的以参赛行为表明其同意该分类方式，亦同意配合主办方开展促销活动。

免责声明：
归焉公司与本网站仅为参赛单元提供比赛展示成果汇总公示服务，不参与各参赛单元的设计活动与线下活动。本站所展示的参赛作品为各小组自行设计。各参赛单元所进行的线下活动和归焉公司无任何关系。`

agd_a.title = soc_a.title = claim

const t: typeof document.createElement = (s: string) => document.createElement(s)
const svg = <S extends keyof SVGElementTagNameMap>(s: S) => document.createElementNS("http://www.w3.org/2000/svg", s)

const section = {
	idnam: {
		idnam: t("a"), id: t("code"), nam: t("span"),
	},

	meta_usr: {
		adm: t("span"), utc: t("span"),
		rej: t("span"), ref: t("span"),
		rej2: t("em"),
		dst: t("span")
	},

	meta_id: {
		adm: t("span"), utc: t("span"), ref: t("span"),
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

	qrcode: {
		qrcode: t("img"),
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

	ordl: {
		orda: t("p"), ordl: t("p"),
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

	id: {
		tid: "id" as const,
		...section.idnam,
		meta: t("section"),
		idl: t("p"),
	},

	usr: {
		tid: "usr" as const,
		...section.idnam,
		...section.meta_usr,
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
		...section.meta_id,
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
		...section.meta_id,
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

	ordl: {
		tid: "ordl" as const,
		pre: t("button"), que: t("button"),
		...section.ordl,
		...section.qrcode,
	},

	ord: {
		tid: "ord" as const, ord: t("article"),
		unam: t("a"), anam: t("a"),
		meta: t("section"),
		msg: t("section"),
		put: t("section"), putc: t("button"), puto: t("button"),
	},

	rec: {
		tid: "rec" as const, rec: t("article"),
		unam: t("a"), anam: t("a"),
		meta: t("section"),
		msg: t("section"),
		re: t("section"), rej: t("span"), ref: t("span"),
		...section.putpro, put: t("button"),
	},

	dst: {
		tid: "dst" as const,
		...section.idnam,
		img: t("img"), intro: t("p"), goal: t("p"), idl: t("p"),
		put: t("button"), preaid: t("button"), preuid: t("button"),
	},

	imgl: {
		tid: "imgl" as const,
		...section.idnam,
		adm1: t("p"),
		...section.cover,
		imgl: t("section"),
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
