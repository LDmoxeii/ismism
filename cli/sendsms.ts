import { smssend } from "../src/ont/sms.ts"

const [nbr, code, hour] = Deno.args

console.log(`sending test sms ${{ nbr, code, hour }}`)
const r = await smssend(nbr, code, hour)
console.log(JSON.stringify(r, null, 2))