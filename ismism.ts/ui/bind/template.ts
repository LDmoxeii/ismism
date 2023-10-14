export const main = document.getElementById("main")! as HTMLDivElement

const tag: typeof document.createElement = (s: string) => document.createElement(s)

const section = {
	id: { idnam: tag("a"), id: tag("code"), nam: tag("span"), mta: tag("p"), msg: tag("p") },
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
