export type User = {
	_id: number,
	nbr: string,
	name: string,
	utc: number,
}
export const uid_ofs = 10000

export type Soc = {
	_id: number,
	name: string,
	uid: number[],
	admin: number[],
	intro: string,
	uid_max: number,
	utc: number,
}
export const sid_ofs = 10000

export type Agenda = {
	_id: number,
	name: string,
	uid: number[],
	sid: number[],
	budget: number,
	fund: number,
	expense: number,
	detail: string,
	goal: Goal[],
	done: string[],
	utc: number,
}
export type Goal = {
	name: string,
	pct: number,
}

export type Work = {
	_id: number,
	uid: number,
	utc: number,
} & ({
	op: "init",
	aid: number,
} | {
	op: "goal",
	aid: number,
	goal: Goal,
} | {
	op: "done",
	aid: number,
	done: string,
} | {
	op: "join",
	aid: number,
	role: string,
} | {
	op: "work",
	aid: number,
	msg: string
})

export type Fund = {
	_id: number,
	uid: number,
	aid: number,
	fund: number,
	utc: number
}

export type Dat = {
	_id: number,
	utc: number,
} & ({
	typ: "imgsrc-aid",
	tid: number,
	img: { title: string, src: string }[]
})
