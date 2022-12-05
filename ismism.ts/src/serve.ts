import { serve } from "https://deno.land/std@0.163.0/http/server.ts"
import { utc_short } from "./date.ts"
import { query } from "./query/query.ts"

async function route(
	req: Request
): Promise<Response> {
	const url = new URL(req.url)
	switch (url.pathname) {
		case "/quit": {
			Deno.exit(); break
		} case "/q": {
			const q = await req.json()
			console.log(`${utc_short(Date.now())} - ${q.query}`)
			return new Response(
				JSON.stringify(await query(q)), {
				status: 200
			})
		}
	}
	console.log(req, url.pathname)
	if (url.pathname == "/quit") Deno.exit()
	return new Response(
		`hello world!\nurl: ${url.pathname}, ${url.hash}, ${url.search}\n${Deno.readTextFileSync("ui/index.html")}`, {
		status: url.pathname.endsWith("webp") ? 401 : 200,
		headers: {
			"content-type": "text/plain",
		}
	})
}

serve(route, { port: 728 })
