export type Id = {
	_id: number,
	nam: string,
	utc: number,
	adm1: string,
	adm2: string,
	intro: string,
} & Re
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

export type Usr = Id & {
	nbr?: string,
	pcode?: { code: number, utc: number },
	ptoken?: string,
}
export type Soc = Id & Rel
export type Agd = Soc & {
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
	aut: ("sup" | "aud" | "aut" | "wsl" | "lit")[],
}
export type Act = {
	_id: string,
	exp: number,
} & ({
	act: "fund",
	aid: Agd["_id"],
	msg: string,
} | {
	act: "nbr",
	uid: number,
})

export type Md = {
	_id: number,
	nam: string,
	utc: number,
	utcp: number,
	uid: Usr["_id"],
	md: string,
	pin?: boolean,
}

export type Wsl = Md
export type Lit = Md
