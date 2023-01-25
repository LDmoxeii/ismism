import { Id } from "./dbtyp.ts"

export function is_id(
	id?: null | Id["_id"]
): id is Id["_id"] {
	return typeof id === "number" && id > 0
}
export function not_id(
	id?: null | Id["_id"]
) {
	return !is_id(id)
}

export function is_name(
	name?: null | Id["name"]
) {
	return typeof name === "string" && /^[\u4E00-\u9FFF]{2,16}$/.test(name)
}
export function not_name(
	name?: null | Id["name"]
) {
	return !is_name(name)
}

export function is_intro(
	intro?: null | Id["intro"]
) {
	return typeof intro === "string" && intro.length <= 4096
}
export function not_intro(
	intro?: null | Id["intro"]
) {
	return !is_intro(intro)
}
