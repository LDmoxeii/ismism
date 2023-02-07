import { DocU } from "../db.ts"
import { Usr } from "../eid/typ.ts"
import { usr_u } from "../eid/usr.ts"
import { Pas } from "./pas.ts"
import { not_pro } from "./pro.ts"

export async function put_usr(
	pas: Pas,
	uid: Usr["_id"],
	u: Pick<Usr, "nam" | "adm1" | "adm2" | "intro">
): DocU {
	if (not_pro(pas) || pas.id.uid !== uid) return null
	return await usr_u(uid, { $set: u })
}
