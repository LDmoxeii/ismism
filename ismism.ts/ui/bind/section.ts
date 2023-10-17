import type { Id } from "../../src/eid/typ.ts"
import { utc_dt } from "../../src/ont/utc.ts"
import { bind } from "./template.ts"

export function idn(
	id: Id["_id"],
	p: "" | "s" | "a" = "",
) {
	const b = bind("id")
	b.id.innerText = `${p}${id}`
	b.nam.innerText = "无效链接"
	b.idnam.href = `#${p}${id}`
	b.mta.innerText = `${p}${id} 是无效 id`
	return b.bind
}

export function id(
	d: Id,
	p: "" | "s" | "a" = "",
): DocumentFragment {
	const b = bind("id")
	b.id.innerText = `${p}${d._id}`
	b.nam.innerText = d.nam
	b.idnam.href = `#${p}${d._id}`
	b.mta.innerText = `城市：${d.adm1} ${d.adm2}`
		+ `\n注册：${utc_dt(d.utc, "medium")}`
	b.msg.innerText = d.msg
	return b.bind
}
