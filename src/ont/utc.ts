export const utc_m = 60 * 1000
export const utc_h = 60 * utc_m
export const utc_d = 24 * utc_h

export const utc_oft = new Date().getTimezoneOffset() * utc_m
const locale_cn = "zh-CN"

export function utc_dt(
    utc: number,
    dt: "short" | "medium" | "pad" | "padutc" = "short",
): string {
    const t = new Date(utc)
    switch (dt) {
        default: case "short": return t.toLocaleString(locale_cn, { dateStyle: "short", timeStyle: "short" }).replaceAll("/", "-")
        case "medium": return t.toLocaleString(locale_cn, { dateStyle: "medium", timeStyle: "short" }).replaceAll("/", "-")
        case "pad": {
            const y = t.getFullYear()
            const m = `${t.getMonth() + 1}`.padStart(2, "0")
            const d = `${t.getDate()}`.padStart(2, "0")
            return `${y}-${m}-${d}`
        }
        case "padutc": {
            const y = t.getUTCFullYear()
            const m = `${t.getUTCMonth() + 1}`.padStart(2, "0")
            const d = `${t.getUTCDate()}`.padStart(2, "0")
            return `${y}-${m}-${d}`
        }
    }
}