import { smssend } from "../src/ontic/sms.ts"

console.log("sending test sms")

const resok = await smssend("19950073736", `${Math.round(Math.random() * 1000000)}`, `${78}`)
console.log(JSON.stringify(resok))

const reserr = await smssend("19950073736-", `${Math.round(Math.random() * 1000000)}`, `${78}`)
console.log(JSON.stringify(reserr))

