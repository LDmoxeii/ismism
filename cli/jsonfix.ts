import { User, Work } from "../ismism.ts/src/typ.ts";

const user: User[] = JSON.parse(Deno.readTextFileSync("json/user.json"))
const work: Work[] = JSON.parse(Deno.readTextFileSync("json/work.json"))

let n = 0
for (const w of work) {
	w._id = ++n
	if (typeof w.uid === "number") continue
	const u = user.find(u => u.name === w.uid as unknown as string)
	console.log(`uid: ${w.uid} -> ${u?._id}`)
	if (u) w.uid = u._id
}
console.log(`scanned ${n} work records`)

Deno.writeTextFileSync("json/work-fix.json", JSON.stringify(work))
