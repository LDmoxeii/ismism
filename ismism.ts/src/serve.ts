import { serve } from "https://deno.land/std@0.163.0/http/server.ts"
import { jwk_load } from "./aut.ts"
import { utc_short } from "./ontic/utc.ts"
import { post, PostPass, query } from "./query.ts"

let etag = `W/"${Date.now()}"`

async function route(
	req: Request
): Promise<Response> {
	const url = new URL(req.url)
	const [_, r, f] = url.pathname.split("/")
	switch (r) {
		case "quit": {
			Deno.exit(); break
		} case "update": {
			etag = `W/"${Date.now()}"`
			console.log(`${utc_short(Date.now())} - etag updated - ${etag}`)
			break
		} case "q": {
			if (req.headers.get("if-none-match")?.includes(etag)) {
				console.log(`${utc_short(Date.now())} - ${f}${url.search} - 304 - ${etag}`)
				return new Response(null, { status: 304, headers: { etag } })
			}
			console.log(`${utc_short(Date.now())} - ${f}${url.search} - 200 - ${etag}`)
			return new Response(
				JSON.stringify(await query(f, url.searchParams)), {
				status: 200,
				headers: { etag }
			})
		} case "p": {
			const p: PostPass = {}
			const cookie = req.headers.get("cookie")
			if (cookie && cookie.startsWith("pp=")) p.jwt = cookie.substring(3)
			const b = await req.text()
			const r = JSON.stringify(await post(f, p, b))
			console.log(`${utc_short(Date.now())} - ${f}#${p.u?.uid ?? ""} - ${b} - ${r}`)
			const headers: Headers = new Headers()
			if (!p.u) headers.set("set-cookie", `pp=""; Path=/p; SameSite=Strict; Secure; HttpOnly; Max-Age=0`)
			else if (p.jwt) headers.set("set-cookie", `pp=${p.jwt}; Path=/p; SameSite=Strict; Secure; HttpOnly; Max-Age=31728728`)
			return new Response(r, { status: 200, headers })
		}
	}
	return new Response(null, { status: 400 })
}

await jwk_load()
serve(route, { port: 728 })
