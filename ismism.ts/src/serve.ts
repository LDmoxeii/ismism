import { serve } from "https://deno.land/std@0.163.0/http/server.ts"
import { utc_short } from "./date.ts"
import { query } from "./query.ts"

let etag = `W/"${Date.now()}"`

async function route(
	req: Request
): Promise<Response> {
	const url = new URL(req.url)
	const [_, p, q] = url.pathname.split("/")
	switch (p) {
		case "quit": {
			Deno.exit(); break
		} case "update": {
			etag = `W/"${Date.now()}"`
			console.log(`${utc_short(Date.now())} - etag updated - ${etag}`)
			break
		} case "q": {
			if (req.headers.get("if-none-match")?.includes(etag)) {
				console.log(`${utc_short(Date.now())} - ${q}${url.search} - 304 - ${etag}`)
				return new Response(null, { status: 304, headers: { etag } })
			}
			console.log(`${utc_short(Date.now())} - ${q}${url.search} - 200 - ${etag}`)
			return new Response(
				JSON.stringify(await query(q, url.searchParams)), {
				status: 200,
				headers: { etag }
			})
		}
	}
	return new Response(null, { status: 400 })
}

serve(route, { port: 728 })
