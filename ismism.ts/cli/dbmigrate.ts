// import { Agenda, Dat, Fund, Soc, User, Work, Worker } from "../src/dbtyp-pre.ts"
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

export type Tag = ""
	| "进行中" | "已结束"
	| "设施建设" | "物资配给" | "软件开发"
	| "苏州" | "成都"
	| "工益公益" | "星星家园"

export type Agenda = {
	_id: number,
	name: string,
	tag: Tag[],
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

import * as T from "../src/dbtyp.ts"

const dfrom = "dbexport"
const dto = "dbimport"

const user = JSON.parse(Deno.readTextFileSync(`${dfrom}/user.json`)) as User[]
const user_t: T.User[] = user.map(u => ({
	_id: u._id,
	name: u.name,
	utc: u.utc,
	referer: u._id > 2 ? [1, 2] : [],
	intro: "",
	nbr: u.name === u.nbr ? undefined : u.nbr,
}))
Deno.writeTextFileSync(`${dto}/user.json`, JSON.stringify(user_t))

const soc = JSON.parse(Deno.readTextFileSync(`${dfrom}/soc.json`)) as Soc[]
const soc_t: T.Soc[] = soc.map(s => ({
	_id: s._id,
	name: s.name,
	utc: s.utc,
	referer: [1, 2],
	intro: s.intro,
	sec: s._id == 2 ? [728] : [],
	uid_max: 128,
	uid: s.uid,
}))
Deno.writeTextFileSync(`${dto}/soc.json`, JSON.stringify(soc_t))

const agenda = JSON.parse(Deno.readTextFileSync(`${dfrom}/agenda.json`)) as Agenda[]
const agenda_t: T.Agenda[] = agenda.map(a => ({
	_id: a._id,
	name: a.name,
	utc: a.utc,
	referer: [1, 2],
	intro: "",
	sec: a._id == 1 ? [728] : [],
	tag: a.tag,
	detail: a.detail,
	imgsrc: a._id == 1 ? undefined : { uid: 728, utc: 1671254608155 + 1000 * a._id },
	budget: a.budget,
	fund: a.fund,
	expense: a.expense,
	goal: a.goal,
}))
Deno.writeTextFileSync(`${dto}/agenda.json`, JSON.stringify(agenda_t))

const worker = JSON.parse(Deno.readTextFileSync(`${dfrom}/worker.json`)) as Worker[]
const worker_t: T.Worker[] = worker.map(w => ({
	_id: { uid: w.uid, aid: w._id.aid, utc: w._id.utc },
	referer: [1, 2],
	role: w.role == "程序员" ? "志愿者" : w.role as T.Role,
}))
Deno.writeTextFileSync(`${dto}/worker.json`, JSON.stringify(worker_t))

const work = JSON.parse(Deno.readTextFileSync(`${dfrom}/work.json`)) as Work[]
const work_t: T.Work[] = work.map(w => {
	const _id = { uid: w.uid, aid: w._id.aid, utc: w._id.utc }
	const referer = [1, 2]
	switch (w.op) {
		case "goal": return { _id, referer, op: "work", msg: "goal" }
		case "work": return { _id, referer, op: w.op, msg: w.msg }
		case "video": return { _id, referer, op: w.op, title: w.title, src: w.src }
	}
})
Deno.writeTextFileSync(`${dto}/work.json`, JSON.stringify(work_t))

const fund = JSON.parse(Deno.readTextFileSync(`${dfrom}/fund.json`)) as Fund[]
const fund_t: T.Fund[] = fund.map(f => ({
	_id: { uid: f.uid, aid: f._id.aid, utc: f._id.utc },
	referer: [1, 2],
	fund: f.fund,
	msg: f.msg,
}))
Deno.writeTextFileSync(`${dto}/fund.json`, JSON.stringify(fund_t))

const dat = JSON.parse(Deno.readTextFileSync(`${dfrom}/dat.json`)) as Dat[]
const imgsrc_t: T.Imgsrc[] = dat.map(d => ({
	_id: { uid: 728, utc: 1671254608155 + 1000 * d._id.aid },
	img: d.img,
}))
Deno.writeTextFileSync(`${dto}/imgsrc.json`, JSON.stringify(imgsrc_t))

const txt_t: T.Txt[] = []
Deno.writeTextFileSync(`${dto}/txt.json`, JSON.stringify(txt_t))
