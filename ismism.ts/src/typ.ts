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

export type Rec = {
	_id: { aid: number, utc: number },
	uid: number,
}
export type Worker = Rec & {
	role: string,
}
export type Work = Rec & ({
	op: "goal",
	goal: Goal[],
} | {
	op: "work",
	msg: string
} | {
	op: "video",
	title: string,
	src: string,
})
export type Fund = Rec & {
	fund: number,
	msg: string,
}

export type Dat = {
	_id: { aid: number, utc: number },
} & ({
	typ: "imgsrc",
	img: { title: string, src: string }[]
})
