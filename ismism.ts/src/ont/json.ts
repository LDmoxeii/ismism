export type Json =
    | null
    | boolean
    | number
    | string
    | Json[]
    | { [key: string]: Json }

export function json<
    T = Json
>(
    s: string
): T | null {
    try { return JSON.parse(`{"${s.replace(/&/g, ',"').replace(/=/g, '":')}}`) }
    catch { return null }
}

export function json_s(
    n: NonNullable<Json>
): string {
    return Object.entries(n)
        .map(([k, v]) => `${k}=${typeof v == "string" ? `"${v}"` : v}`)
        .join("&")
}