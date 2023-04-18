export const utc_m = 60 * 1000
export const utc_h = 60 * utc_m
export const utc_d = 24 * utc_h
export const utc_w = utc_d * 7
const utc_ofs = new Date().getTimezoneOffset() * utc_m
const locale_cn = "zh-CN"

export function utc_dt(
	utc: number,
	dt: "short" | "medium" | "pad" | "padutc" = "short",
): string {
	const t = new Date(utc)
	switch (dt) {
		default: case "short": return t.toLocaleString(locale_cn, { dateStyle: "short", timeStyle: "short" }).replaceAll("/", "-")
		case "medium": return t.toLocaleString(locale_cn, { dateStyle: "medium", timeStyle: "short" })
		case "pad": {
			const y = t.getFullYear()
			const m = `${t.getMonth() + 1}`.padStart(2, "0")
			const d = `${t.getDate()}`.padStart(2, "0")
			return `${y}-${m}-${d}`
		} case "padutc": {
			const y = t.getUTCFullYear()
			const m = `${t.getUTCMonth() + 1}`.padStart(2, "0")
			const d = `${t.getUTCDate()}`.padStart(2, "0")
			return `${y}-${m}-${d}`
		}
	}
}

export function utc_day(
	utc: number
): number {
	return utc - (utc - utc_ofs) % utc_d
}
export function utc_week(
	utc: number
): number {
	const d = new Date(utc_day(utc))
	return d.getTime() - utc_d * ((d.getDay() + 6) % 7)
}
