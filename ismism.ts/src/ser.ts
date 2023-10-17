import { jwk_load } from "./ont/jwt.ts"
import { utc_dt } from "./ont/utc.ts"
import { pos, PasPos } from "./pra/pos.ts"
import { que } from "./pra/que.ts"

let etag = ""

function log(
	utc: number,
	msg: string,
	status?: number,
) {
	console.log(`${utc_dt(utc, "short")} - ${msg} - ${status ?? ""} - ${etag}`)
}

async function handler(
	req: Request
): Promise<Response> {
	const url = new URL(req.url)
	const [_, r] = url.pathname.split("/")
	const utc = Date.now()
	switch (r) {
		case "quit": {
			log(utc, "quit")
			Deno.exit(); break
		} case "update": {
			etag = ""
			log(utc, "etag updated")
			return new Response(null, { status: 200 })
		} case "q": {
			const s = decodeURI(url.search.substring(1))
			if (etag === "") etag = `W/"${utc}"`
			if (req.headers.get("if-none-match")?.includes(etag)) {
				log(utc, `${r}${s}`, 304)
				return new Response(null, { status: 304, headers: { etag } })
			}
			log(utc, `${r}${s}`, 200)
			return new Response(JSON.stringify(await que(s)), { status: 200, headers: { etag } })
		} case "p": {
			const p: PasPos = {}
			const [cookie] = req.headers.get("cookie")?.split(";").filter(c => c.startsWith("pp=")) ?? []
			if (cookie) p.jwt = cookie.substring(3)
			const b = await req.text()
			const r = await pos(p, b)
			if (r && p.etag) etag = p.etag
			const s = JSON.stringify(r)
			log(utc, `#${p.pas?.usr ?? ""} ${b} => ${s}`, 200)
			const headers: Headers = new Headers()
			if (!p.pas) headers.set("set-cookie", `pp=""; Path=/p; SameSite=Strict; Secure; HttpOnly; Max-Age=0`)
			else if (p.jwt) headers.set("set-cookie", `pp=${p.jwt}; Path=/p; SameSite=Strict; Secure; HttpOnly; Max-Age=31728728`)
			return new Response(s, { status: 200, headers })
		}
	}
	return new Response(null, { status: 400 })
}

await jwk_load()
const port = parseInt(Deno.args[0]) ?? 728
Deno.serve({ handler, port })
