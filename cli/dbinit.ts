import { init } from "../ismism.ts/src/db.ts"

const coll = await init()
console.log(`collections created:\n${coll.join("\n")}`)
