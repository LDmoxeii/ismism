import type { Id } from "../../src/eid/typ.ts"
import { utc_dt } from "../../src/ont/utc.ts"
import { bind } from "./template.ts"

export function id(
	d: Id,
	p: "" | "s" | "a" = "",
): DocumentFragment {
	const b = bind("id")
	b.id.innerText = `${d._id}`
	b.nam.innerText = d.nam
	b.idnam.href = `#${p}${d._id}`
	b.mta.innerText = `城市：${d.adm1} ${d.adm2}`
		+ `\n注册：${utc_dt(d.utc, "medium")}`
	b.msg.innerText = d.msg
	return b.bind
}
