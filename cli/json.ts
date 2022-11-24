import { coll, rec_of_aid, rec_of_sid, rec_of_uid, work_recent } from "../ismism.ts/src/db.ts"
import { soc } from "../ismism.ts/src/query/soc.ts"
import { user } from "../ismism.ts/src/query/user.ts"
import { agenda } from "../ismism.ts/src/query/agenda.ts"

const [uid, sid, a, r] = await Promise.all([
	coll.user.find({}, { projection: { _id: 1 } }).toArray(),
	coll.soc.find({}, { projection: { _id: 1 } }).toArray(),
	agenda(),
	work_recent(),
])

await Promise.all(uid.map(async ({ _id }) => {
	const [u, worker, work, fund] = await Promise.all([
		user(_id),
		rec_of_uid(coll.worker, [_id]),
		rec_of_uid(coll.work, [_id]),
		rec_of_uid(coll.fund, [_id]),
	])
	await Deno.writeTextFile(`json/u${_id}.json`, JSON.stringify({
		...u, worker, work, fund
	}))
}))
await Promise.all(sid.map(async ({ _id }) => {
	const [s, worker, work, fund] = await Promise.all([
		soc(_id),
		rec_of_sid(coll.worker, _id),
		rec_of_sid(coll.work, _id),
		rec_of_sid(coll.fund, _id),
	])
	await Deno.writeTextFile(`json/s${_id}.json`, JSON.stringify({
		...s, worker, work, fund
	}))
}))
await Promise.all(a.map(async ({ _id }) => {
	const [worker, work, fund] = await Promise.all([
		rec_of_aid(coll.worker, _id),
		rec_of_aid(coll.work, _id),
		rec_of_aid(coll.fund, _id),
	])
	await Deno.writeTextFile(`json/a${_id}.json`, JSON.stringify({
		worker, work, fund
	}))
}))
await Promise.all([
	Deno.writeTextFile(`json/agenda.json`, JSON.stringify(a)),
	Deno.writeTextFile(`json/recent.json`, JSON.stringify(r)),
])
