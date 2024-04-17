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
    sms?: {code: number, utc: number},
    jwt?: string,
}

export type Soc = Id & {
    sec: Usr["_id"][],
    agr: {msg: string, utc: number},
}

export type Agd = Id & {
    soc: Soc["_id"],
    txt: string,
    utc: number,
}

export type Rec = {
    _id: {usr: Usr["_id"], soc: Soc["_id"], utc: number},
    msg: string,
    amt: number,
    sec?: Usr["_id"],
}

export type Cdt = Rec & {
    utc: {eft: number, exp: number, agr: number},
    aug?: {msg: string,amt: number,utc: number,sec: Usr["_id"]}[],
}

export type Dbt = Rec & {
    rev?: {mag: string, rev: 1 | 2 | 3 | 4 | 5, utc: number},
}

export type Ern = Rec

export type Msg = {
    _id: number,
    nam: string,
    utc: {pre: number, put: number},
    usr: Usr["_id"],
    msg: string,
    pin?: true,
}

export type Wsl = Msg
export type Lit = Msg

export type Aut = {
    _id: 1,
    sup: Usr["_id"][],
    aut: Usr["_id"][],
    wsl: Usr["_id"][],
    lit: Usr["_id"][],
}