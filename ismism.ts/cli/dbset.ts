import { db } from "../src/db.ts"
import { act_c } from "../src/eid/act.ts"
import { aut_c } from "../src/eid/aut.ts"
import { usr_c } from "../src/eid/usr.ts"

await db("ismism", true)

const actid = [
	`ismism${Math.round(Math.random() * 1000000)}`,
	`ismism${Math.round(Math.random() * 1000000)}`,
]

await Promise.all([
	usr_c("11111111111", [1, 2], "江苏", "苏州"),
	act_c({
		_id: actid[0],
		exp: new Date("2023-06-31").getTime(),
		act: "usrnbr", uid: 1
	}),
	aut_c({ _id: 1, p: ["pre_usr", "pro_usr", "pro_soc", "pro_agd"] })
])
await Promise.all([
	usr_c("222222222222", [1, 2], "江苏", "苏州"),
	act_c({
		_id: actid[1],
		exp: new Date("2023-06-31").getTime(),
		act: "usrnbr", uid: 2
	}),
	aut_c({ _id: 2, p: ["pre_usr", "pro_usr", "pro_soc", "pro_agd"] })
])

console.log(actid)
