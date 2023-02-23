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
	reslim: number,
	res: Usr["_id"][],
	uidlim: number,
	uid: Usr["_id"][],
}
export type Agd = Soc & {
	detail: string,
	budget: number,
	fund: number,
	expense: number,
	goal: { nam: string, pct: number }[],
	img: { nam: string, src: string }[],
}

export type Rec = {
	_id: { uid: Usr["_id"], aid: Agd["_id"], utc: number },
	rej: Usr["_id"][],
	ref: Usr["_id"][],
}
export type Work = Rec & ({
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
	aut: ("pre_usr" | "pre_soc" | "pre_agd")[],
}
export type Act = {
	_id: string,
	exp: number,
} & ({
	act: "usrfund",
	ref: Usr["_id"][],
	aid: Agd["_id"]
} | {
	act: "usrnbr",
	uid: number,
})
