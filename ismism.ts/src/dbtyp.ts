export type Id = {
	_id: number,
	name: string,
	utc: number,
	referer: number[],
	intro: string,
}

export type User = Id & {
	nbr?: string,
	pcode?: { code: number, utc: number },
	ptoken?: string
}

export type Soc = Id & {
	sec: number[],
	uid_max: number,
	uid: number[],
}

export type Tag = ""
	| "进行中" | "已结束"
	| "设施建设" | "物资配给" | "软件开发"
	| "苏州" | "成都"
	| "工益公益" | "星星家园"
export type Goal = { name: string, pct: number, }

export type Agenda = Id & {
	sec: number[],
	tag: Tag[],
	detail: string,
	apply?: string,
	imgsrc?: Dat["_id"],
	budget: number,
	fund: number,
	expense: number,
	goal: Goal[],
}

export type Role = "发起人" | "书记" | "志愿者"

export type Rec = {
	_id: { uid: number, aid: number, utc: number },
	referer: number[],
}
export type Worker = Rec & {
	role: Role,
}
export type Work = Rec & ({
	op: "work",
	msg: string,
} | {
	op: "txt",
	title: string,
	src: string,
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
	_id: { uid: number, utc: number },
}
export type Imgsrc = Dat & {
	img: { title: string, src: string }[],
}
export type Txt = Dat & {
	utc_last: number,
	title: string,
	txt: string,
}

export type Act = {
	_id: string,
	exp: number,
} & ({
	act: "usernew",
	referer: number[],
} | {
	act: "usernbr",
	uid: number,
})
