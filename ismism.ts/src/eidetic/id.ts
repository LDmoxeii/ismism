import { Id } from "./dbtyp.ts"

export function is_id(
	id: Id["_id"]
) {
	return id > 0
}
export function not_id(
	id: Id["_id"]
) {
	return !(id > 0)
}

export function is_name(
	name: Id["name"]
) {
	return /^[\u4E00-\u9FFF]{2,16}$/.test(name)
}
export function not_name(
	name: Id["name"]
) {
	return !is_name(name)
}
