export type Id = {
	_id: number,
	utc: number,
	nam: string,
	adm1: string,
	adm2: string,
	msg: string,
}

export type Usr = Id & {
	nbr?: string,
	sms?: { code: number, utc: number },
	jwt?: string,
}
export type Soc = Id & {
	sec: Usr["_id"][],
	cde: boolean,
}
export type Agd = Id & {
	soc: Soc["_id"],
}

export type Rec = {
	_id: { usr: Usr["_id"], soc: Soc["_id"], utc: number },
	msg: string,
	nam: string,
	amt: number,
	sec?: Usr["_id"],
}
export type Cdt = Rec & {
	utc: { eft: number, exp: number }
}
export type Dbt = Rec
export type Ern = Rec

export type Msg = {
	_id: number,
	nam: string,
	utc: { pre: number, put: number },
	uid: Usr["_id"],
	msg: string,
	pin?: boolean,
}
export type Wsl = Msg
export type Lit = Msg

export type Aut = {
	_id: Usr["_id"],
	aut: ("sup" | "aut" | "wsl" | "lit")[],
}
