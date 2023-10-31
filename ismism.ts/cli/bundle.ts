import { bundle } from "https://deno.land/x/emit@0.29.0/mod.ts"

await Promise.all(Deno.args.map(async p => {
	const b = await bundle(`${p}.ts`)
	const c = b.code
	const t = c.replaceAll(/\/\/# sourceMappingURL=.*/g, "")
	console.log(`emitting ${p}.js #${c.length}|${t.length}`)
	await Deno.writeTextFile(`${p}.js`, t)
}))
