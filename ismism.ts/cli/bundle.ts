import { bundle } from "https://deno.land/x/emit@0.17.0/mod.ts"

await Promise.all(Deno.args.map(async p => {
	const b = await bundle(`${p}.ts`)
	const trg = b.code.replaceAll(/\/\/# sourceMappingURL=.*/g, "")
	await Deno.writeTextFile(`${p}.js`, trg)
}))
