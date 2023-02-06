import { serve } from "https://deno.land/std@0.173.0/http/server.ts"
import { jwk_load } from "./ont/jwt.ts"
import { utc_etag, utc_short } from "./ont/utc.ts"
import { pos, PasPos } from "./pra/pos.ts"
import { que } from "./pra/que.ts"

let etag = utc_etag()

function log(
	utc: number,
	msg: string,
	status?: number,
) {
	console.log(`${utc_short(utc)} - ${msg} - ${status ?? ""} - ${etag}`)
}

async function route(
	req: Request
): Promise<Response> {
	const url = new URL(req.url)
	const [_, r, f] = url.pathname.split("/")
	const t = Date.now()
	switch (r) {
		case "quit": {
			log(t, "quit")
			Deno.exit(); break
		} case "update": {
			etag = `W/"${t}"`
			log(t, "etag updated")
			return new Response(null, { status: 200, headers: { etag } })
		} case "q": {
			if (req.headers.get("if-none-match")?.includes(etag)) {
				log(t, `${f}${url.search}`, 304)
				return new Response(null, { status: 304, headers: { etag } })
			}
			log(t, `${f}${url.search}`, 200)
			return new Response(
				JSON.stringify(await que(f, url.searchParams)), {
				status: 200,
				headers: { etag }
			})
		} case "p": {
			const p: PasPos = {}
			const [cookie] = req.headers.get("cookie")?.split(";").filter(c => c.startsWith("pp=")) ?? []
			if (cookie) p.jwt = cookie.substring(3)
			const b = await req.text()
			const r = await pos(p, f, b)
			if (r && p.etag) etag = p.etag
			const s = JSON.stringify(r)
			log(t, `${f}#${p.pas?.id.uid ?? ""} ${b} => ${s}`, 200)
			const headers: Headers = new Headers()
			if (!p.pas) headers.set("set-cookie", `pp=""; Path=/p; SameSite=Strict; Secure; HttpOnly; Max-Age=0`)
			else if (p.jwt) headers.set("set-cookie", `pp=${p.jwt}; Path=/p; SameSite=Strict; Secure; HttpOnly; Max-Age=31728728`)
			return new Response(s, { status: 200, headers })
		}
	}
	return new Response(null, { status: 400 })
}

await jwk_load()
serve(route, { port: 728 })
