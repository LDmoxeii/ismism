import { aut_u } from "../src/eid/aut.ts"
import { db } from "../src/eid/db.ts"
import { soc_u } from "../src/eid/soc.ts"
import { Cdt, Dbt, Ern } from "../src/eid/typ.ts"
import { usr_c, usr_d, usr_r } from "../src/eid/usr.ts"
import { jwk_set } from "../src/ont/jwt.ts"
import { Pas, PasCode, PasPos, pos } from "../src/pra/pos.ts"
import { Pre } from "../src/pra/pre.ts"
import { assertEquals, assert } from "./mod.test.ts"

await db("tst", true)
await jwk_set("testkey")

const json = JSON.stringify

Deno.test("pas", async () => {
	const nbr = "11111111111"
	const usr = await usr_c(nbr, "四川", "成都")
	assertEquals(usr, 1)
	const p: PasPos = {}
	assertEquals(null, await pos(p, "pas", ""))
	assertEquals(p, { etag: null, pas: null })
	assertEquals(await pos(p, "pas", json({ nbr, sms: false })), { sms: false })
	const pascode = await pos(p, "pas", json({ nbr, sms: true })) as PasCode
	assert(pascode && pascode.sms === false && pascode.utc && pascode.utc > 0)
	const sms = await usr_r({ _id: usr! }, { sms: 1 })
	assert(sms && sms.sms && sms.sms.code > 0)
	const code = sms.sms.code
	assert(null === await pos(p, "pas", json({ nbr, code: code + 1 })))
	assertEquals(p, { etag: null, pas: null })
	const pas = await pos(p, "pas", json({ nbr, code: code })) as Pas
	assert(p.jwt && p.jwt.length > 0 && p.pas && p.pas.usr === usr)
	const jwt = p.jwt
	assertEquals(p.pas, pas)
	assertEquals(await pos(p, "pas", ""), pas)
	assertEquals(p, { etag: null, pas, jwt: null })
	assertEquals(await pos(p, "pas", ""), null)
	await pos(p, "pas", json({ nbr, code: code }))
	assertEquals(p.jwt, jwt)
	assertEquals(await pos(p, "pas", json({ usr: p.pas.usr })), 1)
	assertEquals(p, { etag: null, pas: null, jwt: null })
	assertEquals(await usr_r({ _id: usr }, { jwt: 1 }), { _id: usr })
	await usr_d(usr)
})

Deno.test("pre", async () => {
	const nbr = ["11111111111", "11111111112", "11111111113"]
	const [adm1, adm2] = ["广东", "汕头"]
	const cdt: Cdt = {
		_id: { usr: 2, soc: 1, utc: Date.now() }, msg: "cdt", amt: 10,
		utc: { eft: Date.now() - 10000, exp: Date.now() + 10000 }, sec: 2
	}
	const dbt: Dbt = { _id: { usr: 2, soc: 1, utc: Date.now() }, msg: "dbt", amt: 5 }
	const dbt2: Dbt = { _id: { usr: 2, soc: 1, utc: Date.now() + 1 }, msg: "dbt", amt: 10 }
	const ern: Ern = { _id: { usr: 2, soc: 1, utc: Date.now() }, msg: "ern", amt: 5, sec: 2 }

	await usr_c(nbr[0], "江苏", "苏州")
	const u2 = (await usr_c(nbr[1], "四川", "成都"))!
	const p: PasPos = {}
	await pos(p, "pas", json({ nbr: nbr[1], sms: false }))
	const { sms } = (await usr_r({ _id: u2 }, { sms: 1 }))!
	await pos(p, "pas", json({ nbr: nbr[1], code: sms!.code }))
	const jwt = p.jwt
	assertEquals([3, 1, null, null, null, null, null, null], await Promise.all([
		pos({ jwt }, "pre", json({ pre: "usr", nbr: nbr[2], adm1, adm2 } as Pre)),
		await pos({ jwt }, "pre", json({ pre: "soc", nam: "俱乐部", adm1, adm2 } as Pre)),
		pos({ jwt }, "pre", json({ pre: "agd", nam: "活动", soc: 1 } as Pre)),
		pos({ jwt }, "pre", json({ pre: "cdt", cdt } as Pre)),
		pos({ jwt }, "pre", json({ pre: "dbt", dbt } as Pre)),
		pos({ jwt }, "pre", json({ pre: "ern", ern } as Pre)),
		pos({ jwt }, "pre", json({ pre: "wsl", nam: "标题" } as Pre)),
		pos({ jwt }, "pre", json({ pre: "lit", nam: "标题" } as Pre)),
	]))
	await Promise.all([
		aut_u({ $set: { wsl: [2], lit: [2] } }),
		soc_u(1, { $set: { sec: [2, 3] } })
	])
	const r = await Promise.all([
		pos({ jwt }, "pre", json({ pre: "agd", nam: "活动", soc: 1 } as Pre)),
		await pos({ jwt }, "pre", json({ pre: "cdt", cdt } as Pre)),
		await pos({ jwt }, "pre", json({ pre: "cdt", cdt } as Pre)),
		await pos({ jwt }, "pre", json({ pre: "dbt", dbt } as Pre)),
		await pos({ jwt }, "pre", json({ pre: "dbt", dbt: dbt2 } as Pre)),
		pos({ jwt }, "pre", json({ pre: "ern", ern } as Pre)),
		pos({ jwt }, "pre", json({ pre: "wsl", nam: "标题" } as Pre)),
		pos({ jwt }, "pre", json({ pre: "lit", nam: "标题" } as Pre)),
	])
	assertEquals([true, true, false, true, false, true, true, true], r.map(r => r != null))
})
