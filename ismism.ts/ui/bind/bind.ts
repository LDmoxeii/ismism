import { que } from "./fetch.ts"

console.log("从零开发！")

const adm = await que({ que: "adm" })

console.log(adm)