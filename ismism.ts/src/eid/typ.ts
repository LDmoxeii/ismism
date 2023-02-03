export type Id = {
	_id: number,
	nam: string,
	rej: Usr["_id"][],
	ref: Usr["_id"][],
	utc: number,
	adm1: string,
	adm2: string,
	intro: string,
}
export type Usr = Id & {
	nbr?: string,
	pcode?: { code: number, utc: number },
	ptoken?: string,
}
export type Soc = Id & {
	sec: Usr["_id"][],
	uid_max: number,
	uid: Usr["_id"][],
	res_max: number,
	res: Usr["_id"][],
}
export type Agd = Id & {
	detail: string,
	budget: number,
	fund: number,
	expense: number,
	goal: { nam: string, pct: number }[],
	img: { nam: string, src: string }[],
	res_max: number,
}

export type Rec = {
	_id: { uid: Usr["_id"], aid: Agd["_id"], utc: number },
	rej: Usr["_id"][],
	ref: Usr["_id"][],
}
export type Worker = Rec & {
	exp: number,
	rol: "sec" | "worker" | "res",
}
export type Work = Rec & ({
	work: "work",
	msg: string,
} | {
	work: "txt",
	nam: string,
	txt: string,
} | {
	work: "video",
	nam: string,
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
	act: "usrnew",
	ref: number[],
} | {
	act: "usrnbr",
	uid: number,
})
export type Aut = {
	_id: Usr["_id"],
	p: string[],
}
