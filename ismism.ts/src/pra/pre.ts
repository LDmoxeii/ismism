import { Act, Usr } from "../eid/typ.ts"
import { act_u, act_r } from "../eid/act.ts"
import { usr_c, usr_u } from "../eid/usr.ts"
import { is_id } from "../eid/id.ts"
import { DocC } from "../db.ts"

export async function pre_usr(
	actid: Act["_id"],
	nbr: NonNullable<Usr["nbr"]>,
	adm1: string,
	adm2: string,
): DocC<Usr["_id"]> {
	const a = await act_r(actid)
	if (a) switch (a.act) {
		case "usrnew": {
			const uid = await usr_c(nbr, a.ref, adm1, adm2)
			if (is_id(uid)) await act_u(actid, { $set: { exp: Date.now() } })
			return uid
		} case "usrnbr": {
			const u = await usr_u(a.uid, { $set: { nbr, adm1, adm2 } })
			if (u && u > 0) {
				await act_u(actid, { $set: { exp: Date.now() } })
				return a.uid
			} break
		}
	}
	return null
}
