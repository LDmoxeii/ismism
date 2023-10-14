import type { Id, Usr } from "../../src/eid/typ.ts"
import { id } from "./section.ts"

export function usr(
	_id: Usr["_id"]
): HTMLElement {
	const t = document.createElement("article")
	const u: Id = {
		_id, utc: Date.now(), nam: "用户名", adm1: "四川", adm2: "成都",
		msg: "用户介绍\n联系方式\n\n测试"
	}
	t.append(id(u), id(u))
	return t
}
