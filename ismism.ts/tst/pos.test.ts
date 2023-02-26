import type { Pas } from "../src/pra/pas.ts"
import { assert, assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts"
import { db } from "../src/db.ts"
import { usr_c, usr_d, usr_r } from "../src/eid/usr.ts"
import { jwk_set } from "../src/ont/jwt.ts"
import { PasCode, PasPos, pos } from "../src/pra/pos.ts"

await db("tst", true)
await jwk_set("testkey")

const json = JSON.stringify

Deno.test("pas", async () => {
	const nbr = "11111111111"
	const uid = await usr_c(nbr, "四川", "成都")
	assert(uid === 1)
	const p: PasPos = {}
	assert(null === await pos(p, "pas", ""))
	assertEquals(p, { etag: null, pas: null })
	assertEquals(await pos(p, "pas", json({ nbr, sms: false })), { sms: false })
	const pascode = await pos(p, "pas", json({ nbr, sms: true })) as PasCode
	assert(pascode && pascode.sms === false && pascode.utc && pascode.utc > 0)
	const pcode = await usr_r({ _id: uid }, { pcode: 1 })
	assert(pcode && pcode.pcode && pcode.pcode.code > 0)
	const code = pcode.pcode.code
	assert(null === await pos(p, "pas", json({ nbr, code: code + 1 })))
	assertEquals(p, { etag: null, pas: null })
	const pas = await pos(p, "pas", json({ nbr, code: code })) as Pas
	assert(p.jwt && p.jwt.length > 0 && p.pas && p.pas.uid === uid)
	const jwt = p.jwt
	assertEquals(p.pas, pas)
	assertEquals(await pos(p, "pas", ""), pas)
	assertEquals(p, { etag: null, pas, jwt: null })
	assertEquals(await pos(p, "pas", ""), null)
	await pos(p, "pas", json({ nbr, code: code }))
	assertEquals(p.jwt, jwt)
	assertEquals(await pos(p, "pas", json({ uid: p.pas.uid })), 1)
	assertEquals(p, { etag: null, pas: null, jwt: null })
	assertEquals(await usr_r({ _id: uid }, { ptoken: 1 }), { _id: uid })
	await usr_d(uid)
})
