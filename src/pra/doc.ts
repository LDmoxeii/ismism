import { coll } from "../eid/db.ts"
import { idadm, idnam } from "../eid/id.ts"

export async function adm(
) {
    const [adm1, adm2] = await Promise.all([idadm("adm1"), idadm("adm2")])
    const soc = await idnam(coll.soc, adm1.flatMap(a => a[1]))
    soc.sort((a, b) => a[0] - b[0])
    return { adm1, adm2, soc }
}