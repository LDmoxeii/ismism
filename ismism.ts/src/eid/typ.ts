export type Id = {
	_id: number,
	utc: number,
	nam: string,
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
	uid: Usr["_id"][],
	res?: Usr["_id"][],
}
export type Itm = {
	nam: string,
	rmb: number,
	amt: number,
}
export type Mnu = {
	nam: string,
	utc: { start: number, end: number },
	lim: { amt: number, sum: number, week: number },
	itm: Itm[],
	loc: { nam: string, src: string }[],
}

export type Usr = Id & Re & {
	nbr?: string,
	sms?: { code: number, utc: number },
	jwt?: string,
}
export type Agd = Id & Re & Rel & {
	acc: { src: string, budget: number, fund: number, expense: number },
	gol: { nam: string, pct: number }[],
	img: { nam: string, src: string }[],
	mnu: Mnu[],
}
export type Soc = Id & Re & Rel

export type Rec = {
	_id: { uid: Usr["_id"], aid: Agd["_id"], utc: number },
}
export type Work = Rec & Re & {
	msg: string,
}
export type Video = Rec & Re & {
	nam: string,
	src: string,
}
export type Live = Rec & Re & {
	nam: string,
	src: string,
	utc: { start: number, end: number },
}
export type Ord = Rec & {
	nam: string,
	itm: Itm[],
	fin: boolean,
	rev?: { uid: Usr["_id"][], mrk: number, msg: string },
	loc?: Mnu["loc"][0],
	rd?: Dst["_id"]["rd"],
}
export type Dst = {
	_id: { rd: number, aid: Agd["_id"], uid?: Usr["_id"] },
}

export type Aut = {
	_id: Usr["_id"],
	aut: ("sup" | "aud" | "aut" | "wsl" | "lit")[],
}
export type Act = {
	_id: string,
	exp: number,
	aid: Agd["_id"],
	nam: string,
	itm: Itm[],
	rd?: Dst["_id"]["rd"],
}

export type Md = {
	_id: number,
	nam: string,
	utc: { pre: number, put: number },
	uid: Usr["_id"],
	md: string,
	pin?: boolean,
}
export type Wsl = Md
export type Lit = Md
