export const utc_h = 60 * 60 * 1000
export const utc_d = 24 * utc_h

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
export function utc_date(
	utc: number,
	zone = false,
) {
	const t = new Date(utc)
	const y = t.getFullYear()
	const m = `${t.getMonth() + 1}`.padStart(2, "0")
	const d = `${t.getDate()}`.padStart(2, "0")
	return `${y}-${m}-${d}` + (zone ? "T00:00:00.000+08:00" : "")
}

export function utc_etag(
) {
	return `W/"${Date.now()}"`
}

export function utc_week(
	utc: number
): number {
	const date = new Date(utc_date(utc, true))
	return date.getTime() - utc_d * ((date.getDay() + 6) % 7)
}
