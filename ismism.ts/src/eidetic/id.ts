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

export function is_intro(
	intro: Id["intro"]
) {
	return intro.length < 4096
}
export function not_intro(
	intro: Id["intro"]
) {
	return !is_intro(intro)
}
