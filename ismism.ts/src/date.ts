export function utc_short(
	utc: number
) {
	return new Date(utc).toLocaleString("zh-CN", { dateStyle: "short", timeStyle: "short" }).replaceAll("/", "-")
}
export function utc_medium(
	utc: number
) {
	return new Date(utc).toLocaleString("zh-CN", { dateStyle: "medium", timeStyle: "short" })
}
