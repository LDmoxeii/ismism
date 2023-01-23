import { reset } from "../src/db.ts"

const coll = await reset()
console.log(`doen resetting db with coll: ${coll.join(" ")}`)
