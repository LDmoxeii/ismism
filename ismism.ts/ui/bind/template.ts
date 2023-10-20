export const pas = document.getElementById("pas")! as HTMLAnchorElement
export const main = document.getElementById("main")! as HTMLDivElement

const tag: typeof document.createElement = (s: string) => document.createElement(s)

const section = {
	id: { idnam: tag("a"), id: tag("code"), nam: tag("span"), mta: tag("p"), msg: tag("p") },
	sms: { nbr: tag("input"), sms: tag("button"), hint: tag("p") },
	code: { code: tag("input"), send: tag("button") },
	put_id: { nam: tag("input"), adm1: tag("select"), adm2: tag("select"), msg: tag("textarea") },
	btn_usr: { put: tag("button"), clr: tag("button") },
	btn_put: { del: tag("button"), put: tag("button"), ret: tag("button") },
}
export type Section = typeof section

export type Bind<
	T extends keyof Section
> = {
	bind: DocumentFragment
} & Section[T]

export function bind<
	T extends keyof Section
>(
	tid: T
): Bind<T> {
	const temp = document.getElementById(tid) as HTMLTemplateElement
	const t = temp.content.cloneNode(true) as DocumentFragment
	return Object.fromEntries([["bind", t], ...Object.keys(section[tid]).map(c =>
		[c, t.querySelector(`.${c}`)])
	]) as Bind<T>
}
