import { bundle } from "https://deno.land/x/emit@0.31.5/mod.ts"

await Promise.all(Deno.args.map(async p => {
    const b = await bundle(`${p}.ts`)
    const c = b.code
    await Deno.writeTextFile(`${p}.js`, c)
}))
