import { smssend } from "../src/sms.ts"

console.log("sending test sms")

const resok = await smssend("18200145532", `${Math.round(Math.random() * 1000000)}`, `${78}`)
console.log(JSON.stringify(resok))

const reserr = await smssend("1820014553-", `${Math.round(Math.random() * 1000000)}`, `${78}`)
console.log(JSON.stringify(reserr))

