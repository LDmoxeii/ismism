import { coll } from "./db.ts"

export async function uname(
	uid: number[]
): Promise<[number, string][]> {
	const user = await coll.user.find({
		_id: { "$in": uid }
	}, {
		projection: { _id: 1, name: 1 }
	}).toArray()
	return user.map(u => [u._id, u.name])
}

export async function user_profile(
	uid: number
) {
	const user = await coll.user.findOne({
		_id: uid
	}, {
		projection: { _id: 1, name: 1, utc: 1 }
	})
	// deno-lint-ignore no-explicit-any
	const soc = await coll.soc.find({ uid } as any, {
		projection: { _id: 1, name: 1, intro: 1 }
	}).toArray()
	const work = await coll.work.find({ uid }).toArray()
	const fund = await coll.fund.find({ uid }).toArray()
	const aid = [...work.flatMap(w =>
		typeof w.aid === "number" ? [w.aid] : w.aid
	), ...fund.map(f => f.aid)]
	const agenda = await aname(aid)
	return { user, soc, work, fund, agenda }
}

export async function aname(
	aid: number[]
): Promise<[number, string][]> {
	const agenda = await coll.agenda.find({
		_id: { "$in": aid }
	}, {
		projection: { _id: 1, name: 1 }
	}).toArray()
	return agenda.map(u => [u._id, u.name])
}
