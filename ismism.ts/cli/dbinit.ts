import { init } from "../src/db.ts"

const coll = await init()
console.log(`collections created:\n${coll.join("\n")}`)
