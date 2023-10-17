import { db } from "../src/eid/db.ts"
import { Cdt, Dbt, Ern } from "../src/eid/typ.ts"
import { usr_c, usr_d, usr_r } from "../src/eid/usr.ts"
import { jwk_set } from "../src/ont/jwt.ts"
import { PsgRet } from "../src/pra/pas.ts"
import { PasPos, pos } from "../src/pra/pos.ts"
import { Pre } from "../src/pra/pre.ts"
import { Put } from "../src/pra/put.ts"
import { assertEquals, assert } from "./mod.test.ts"

await db("tst", true)
await jwk_set("testkey")

const json = JSON.stringify

Deno.test("pas", async () => {
	const nbr = "11111111111"
	const usr = await usr_c(nbr, "四川", "成都")
	assertEquals(usr, 1)
	const p: PasPos = {}
	assertEquals(null, await pos(p, ""))
	assertEquals(p, { etag: null, pas: null })
	assertEquals(await pos(p, json({ psg: "sms", nbr, sms: false })), { sms: false })
	const pascode = await pos(p, json({ psg: "sms", nbr, sms: true })) as PsgRet["sms"]
	assert(pascode && pascode.sms === false && pascode.utc && pascode.utc > 0)
	const sms = await usr_r({ _id: usr! }, { sms: 1 })
	assert(sms && sms.sms && sms.sms.code > 0)
	const code = sms.sms.code
	assert(null === await pos(p, json({ psg: "code", nbr, code: code + 1 })))
	assertEquals(p, { etag: null, pas: null })
	const pas = await pos(p, json({ psg: "code", nbr, code: code })) as PsgRet["code"]
	assert(p.jwt && p.jwt.length > 0 && p.pas && p.pas.usr === usr)
	const jwt = p.jwt
	assertEquals(p.pas, pas)
	assertEquals(await pos(p, json({ psg: "pas" })), pas)
	assertEquals(p, { etag: null, pas, jwt: null })
	assertEquals(await pos(p, ""), null)
	await pos(p, json({ psg: "code", nbr, code: code }))
	assertEquals(p.jwt, jwt)
	assertEquals(await pos(p, json({ psg: "clr", usr: p.pas.usr })), 1)
	assertEquals(p, { etag: null, pas: null, jwt: null })
	assertEquals(await usr_r({ _id: usr }, { jwt: 1 }), { _id: usr })
	await usr_d(usr)
})

Deno.test("pre-put", async () => {
	const nbr = ["11111111111", "11111111112", "11111111113"]
	const [adm1, adm2] = ["广东", "汕头"]
	const cdt: Cdt = {
		_id: { usr: 2, soc: 1, utc: Date.now() }, msg: "cdt", amt: 10,
		utc: { eft: Date.now() - 10000, exp: Date.now() + 10000, agr: 0 }, sec: 2
	}
	const dbt: Dbt = { _id: { usr: 2, soc: 1, utc: Date.now() }, msg: "dbt", amt: 5 }
	const dbt2: Dbt = { _id: { usr: 2, soc: 1, utc: Date.now() + 1 }, msg: "dbt", amt: 10 }
	const ern: Ern = { _id: { usr: 2, soc: 1, utc: Date.now() }, msg: "ern", amt: 5, sec: 2 }

	await usr_c(nbr[0], "江苏", "苏州")
	const u2 = (await usr_c(nbr[1], "四川", "成都"))!
	const p: PasPos = {}
	await pos(p, json({ psg: "sms", nbr: nbr[1], sms: false }))
	const { sms } = (await usr_r({ _id: u2 }, { sms: 1 }))!
	await pos(p, json({ psg: "code", nbr: nbr[1], code: sms!.code }))
	const jwt = p.jwt
	assertEquals([
		3, 1, null, null, null, null, null, null,
		1, null, null, 1, 1, 1, 1,
	], await Promise.all([
		pos({ jwt }, json({ pre: "usr", nbr: nbr[2], adm1, adm2 } as Pre)),
		await pos({ jwt }, json({ pre: "soc", nam: "俱乐部", adm1, adm2 } as Pre)),
		pos({ jwt }, json({ pre: "agd", nam: "活动", soc: 1 } as Pre)),
		pos({ jwt }, json({ pre: "cdt", cdt } as Pre)),
		pos({ jwt }, json({ pre: "dbt", dbt } as Pre)),
		pos({ jwt }, json({ pre: "ern", ern } as Pre)),
		pos({ jwt }, json({ pre: "wsl", nam: "标题" } as Pre)),
		pos({ jwt }, json({ pre: "lit", nam: "标题" } as Pre)),

		pos({ jwt }, json({ put: "usr", usr: 2, nam: "用户", adm1, adm2, msg: "消息" } as Put)),
		pos({ jwt }, json({ put: "soc", soc: 1, msg: "消息" } as Put)),
		pos({ jwt }, json({ put: "soc", soc: 1, agr: "消息" } as Put)),
		await pos({ jwt }, json({ put: "soc", soc: 1, nam: "同城俱乐部", adm1, adm2, sec: [2, 3] } as Put)),
		pos({ jwt }, json({ put: "soc", soc: 1, msg: "消息" } as Put)),
		await pos({ jwt }, json({ put: "soc", soc: 1, agr: "同意" } as Put)),
		pos(p, json({ put: "aut", aut: [2], wsl: [2], lit: [2] } as Put))
	]))
	assertEquals([], p.pas?.agr); p.jwt = jwt

	const rpre = await Promise.all([
		pos({ jwt }, json({ pre: "agd", nam: "活动", soc: 1 } as Pre)),
		await pos({ jwt }, json({ pre: "cdt", cdt } as Pre)),
		await pos({ jwt }, json({ pre: "cdt", cdt } as Pre)),
		await pos(p, json({ pre: "dbt", dbt } as Pre)),
		await pos({ jwt }, json({ pre: "dbt", dbt: dbt2 } as Pre)),
		pos({ jwt }, json({ pre: "ern", ern } as Pre)),
		pos({ jwt }, json({ pre: "wsl", nam: "标题" } as Pre)),
		pos({ jwt }, json({ pre: "lit", nam: "标题" } as Pre)),
	])
	assertEquals([true, true, false, true, false, true, true, true], rpre.map(r => r != null))
	assertEquals([1], p.pas?.agr); p.jwt = jwt

	assertEquals([1, 1, 1, 0, 1, 1, 0, null, 1, 1, 1, 0, 1], await Promise.all([
		pos({ jwt }, json({ put: "agd", agd: 1, msg: "活动介绍" } as Put)),
		pos({ jwt }, json({ put: "agd", agd: 1, nam: "活动介绍", adm1, adm2 } as Put)),
		pos({ jwt }, json({ put: "agd", agd: 1 } as Put)),
		pos({ jwt }, json({ put: "agd", agd: 1 } as Put)),
		await pos({ jwt }, json({ put: "cdt", id: cdt._id, agr: 3 } as Put)),
		pos(p, json({ put: "cdt", id: cdt._id } as Put)),
		pos({ jwt }, json({ put: "cdt", id: cdt._id } as Put)),
		pos({ jwt }, json({ put: "cdt", id: cdt._id, agr: 5 } as Put)),
		pos({ jwt }, json({ put: "dbt", id: dbt._id } as Put)),
		pos({ jwt }, json({ put: "ern", id: ern._id } as Put)),
		pos({ jwt }, json({ put: "wsl", id: 1, msg: "wslmsg", nam: "标题三", pin: true } as Put)),
		pos({ jwt }, json({ put: "wsl", id: 1, pin: false } as Put)),
		pos({ jwt }, json({ put: "lit", id: 1 } as Put)),
	]))
	assertEquals([], p.pas?.agr)
	await Promise.all([usr_d(1), usr_d(2), usr_d(3)])
})
