import { db } from "../src/db.ts"
// import { act_c } from "../src/eid/act.ts"
// import { aut_c } from "../src/eid/aut.ts"
// import { usr_c, usr_u } from "../src/eid/usr.ts"

await db("ismism", true)

// const exp = new Date("2023-06-31").getTime()
// const actid = [
// 	`ismism${Math.round(Math.random() * 1000000)}`,
// 	`ismism${Math.round(Math.random() * 1000000)}`,
// ]

// const [uid1] = await Promise.all([
// 	usr_c("11111111111", "江苏", "苏州"),
// 	act_c({ _id: actid[0], exp, act: "nbr", uid: 1 }),
// 	aut_c({ _id: 1 }),
// ])
// const [uid2] = await Promise.all([
// 	usr_c("11111111112", "江苏", "苏州"),
// 	act_c({ _id: actid[1], exp, act: "nbr", uid: 2 }),
// 	aut_c({ _id: 2 }),
// ])
// await Promise.all([
// 	usr_u(uid1!, { $set: { nam: "未明子", ref: [1, 2] } }),
// 	usr_u(uid1!, { $unset: { nbr: "" } }),
// 	usr_u(uid2!, { $set: { nam: "张正午", ref: [1, 2] } }),
// 	usr_u(uid2!, { $unset: { nbr: "" } }),
// ])

// console.log([uid1, uid2], actid)
