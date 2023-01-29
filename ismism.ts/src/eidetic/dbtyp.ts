export type Id = {
	_id: number,
	name: string,
	ref: User["_id"][],
	utc: number,
	adm1: string,
	adm2: string,
	intro: string,
}
export type User = Id & {
	nbr?: string,
	pcode?: { code: number, utc: number },
	ptoken?: string,
}
export type Soc = Id & {
	sec: User["_id"][],
	uid_max: number,
	uid: User["_id"][],
}
export type Agenda = Id & {
	detail: string,
	budget: number,
	fund: number,
	expense: number,
	goal: { name: string, pct: number }[],
	img: { name: string, src: string }[],
	candidate: number,
}

export type Rec = {
	_id: { uid: User["_id"], aid: Agenda["_id"], utc: number },
	ref: User["_id"][],
	rej: User["_id"][],
}
export type Worker = Rec & {
	exp: number,
	role: "sec" | "worker" | "candidate",
}
export type Work = Rec & ({
	work: "work",
	msg: string,
} | {
	work: "txt",
	name: string,
	txt: string,
} | {
	work: "video",
	name: string,
	src: string,
})
export type Fund = Rec & {
	fund: number,
	msg: string,
}

export type Act = {
	_id: string,
	exp: number,
} & ({
	act: "usernew",
	ref: number[],
} | {
	act: "usernbr",
	uid: number,
})
export type Aut = {
	_id: User["_id"],
	p: string[],
}
