import { serve } from "https://deno.land/std@0.163.0/http/server.ts"

async function handle(
	req: Request
): Promise<Response> {
	const url = new URL(req.url)
	console.log(req, url.pathname)
	return new Response(
		`hello world!\nurl: ${url.pathname}, ${url.hash}, ${url.search}`, {
		status: url.pathname.endsWith("webp") ? 401 : 200,
		headers: {
			"content-type": "text/plain",
		}
	})
}

serve(handle, { port: 728 })
