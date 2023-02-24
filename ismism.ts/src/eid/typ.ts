export type Id = {
	_id: number,
	nam: string,
	utc: number,
	adm1: string,
	adm2: string,
	intro: string,
}
export type Re = {
	rej: Usr["_id"][],
	ref: Usr["_id"][],
}
export type Rel = {
	sec: Usr["_id"][],
	uidlim: number,
	uid: Usr["_id"][],
	reslim: number,
	res: Usr["_id"][],
}

export type Usr = Id & Re & {
	nbr?: string,
	pcode?: { code: number, utc: number },
	ptoken?: string,
}
export type Soc = Id & Re & Rel
export type Agd = Id & Re & Rel & {
	account: string,
	budget: number,
	fund: number,
	expense: number,
	goal: { nam: string, pct: number }[],
	img: { nam: string, src: string }[],
}

export type Rec = {
	_id: { uid: Usr["_id"], aid: Agd["_id"], utc: number },
}
export type Work = Rec & Re & ({
	work: "work",
	msg: string,
} | {
	work: "video",
	nam: string,
	src: string,
})
export type Fund = Rec & {
	fund: number,
	msg: string,
}

export type Aut = {
	_id: Usr["_id"],
}
export type Act = {
	_id: string,
	exp: number,
} & ({
	act: "usrfund",
	ref: Usr["_id"][],
	aid: Agd["_id"],
} | {
	act: "usrnbr",
	uid: number,
})
