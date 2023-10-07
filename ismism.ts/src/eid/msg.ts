import type { Msg } from "./typ.ts"
import type { Coll, DocC, DocD, DocR, DocU, Proj, Updt } from "./db.ts"
import { is_id, is_lim, is_msg, is_nam, lim_msg, lim_msg_f, lim_msg_pin } from "./is.ts"

async function msg_n(
	c: Coll<Msg>
): Promise<Msg["_id"]> {
	const l = await c.findOne({}, { projection: { _id: 1 }, sort: { _id: -1 } })
	return l ? l._id + 1 : 1
}

export async function msg_c(
	c: Coll<Msg>,
	nam: Msg["nam"],
	usr: Msg["usr"]
): DocC<Msg["_id"]> {
	if (!is_nam(nam) || !is_id(usr)) return null
	const utc = Date.now()
	try {
		return await c.insertOne({
			_id: await msg_n(c),
			nam, utc: { pre: utc, put: utc }, usr,
			msg: "",
		}) as Msg["_id"]
	}
	catch { return null }
}

export async function msg_r<
	P extends keyof Msg,
>(
	c: Coll<Msg>,
	_id: Msg["_id"],
	projection?: Proj<Msg, P>,
): DocR<Pick<Msg, "_id" | P>> {
	if (!is_id(_id)) return null
	return await c.findOne({ _id }, { projection }) ?? null
}

export async function msg_f(
	c: Coll<Msg>,
	id: Msg["_id"],
): Promise<Msg[]> {
	const top = !is_id(id)
	const pin = await c.find({ pin: true }, {
		sort: { "utc.put": -1 },
		projection: top ? undefined : { _id: 1 },
	}).toArray()
	const f = {
		...top ? {} : { $lt: id },
		$nin: pin.map(p => p._id),
	}
	const msg = await c.find({ _id: f }, { sort: { _id: -1 }, limit: lim_msg_f }).toArray()
	return top ? [...pin, ...msg] : msg
}

export async function msg_u(
	c: Coll<Msg>,
	_id: Msg["_id"],
	u: Updt<Msg>
): DocU {
	if (!is_id(_id)) return null
	if ("$set" in u && u.$set) {
		const s = u.$set
		if (s.nam && !is_nam(s.nam)) return null
		if (s.msg && !is_msg(s.msg, lim_msg)) return null
		if (s.pin && !is_lim(await c.countDocuments({ pin: true }) + 1, lim_msg_pin)) return null
	}
	try {
		const { matchedCount, modifiedCount } = await c.updateOne({ _id }, u)
		if (matchedCount > 0) return modifiedCount > 0 ? 1 : 0
		else return null
	} catch { return null }
}

export async function msg_d(
	c: Coll<Msg>,
	_id: Msg["_id"],
): DocD {
	if (!is_id(_id)) return null
	try {
		const d = await c.deleteOne({ _id })
		return d > 0 ? 1 : 0
	} catch { return null }
}
