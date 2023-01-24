import { serve } from "https://deno.land/std@0.173.0/http/server.ts"
import { jwk_load } from "./ontic/jwt.ts"
import { utc_short } from "./ontic/utc.ts"
import { query } from "./praxic/query.ts"

let etag = `W/"${Date.now()}"`

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
				JSON.stringify(await query(f, url.searchParams)), {
				status: 200,
				headers: { etag }
			})

		}
	}
	return new Response(null, { status: 400 })
}

await jwk_load()
serve(route, { port: 728 })
