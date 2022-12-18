import { reset } from "../src/db.ts"

const coll = await reset()
console.log(`done resetting db:\n${coll.join("\n")}`)
