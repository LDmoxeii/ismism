import { Collection, MongoClient } from "https://deno.land/x/mongo@v0.31.1/mod.ts"
import { User } from "../ismism.ts/src/typ.ts"

const mongo = new MongoClient()
await mongo.connect("mongodb://127.0.0.1:27017")

console.log(await mongo.database("ismism").listCollectionNames())

const user: Collection<User> = mongo.database("ismism").collection("user")
try { await user.drop() } catch (e) { console.error(e) }
console.log(await user.createIndexes({
	indexes: [{
		key: { nbr: 1 },
		name: "nbr",
		unique: true,
	}, {
		key: { name: 1 },
		name: "name",
		unique: true
	}]
}))
