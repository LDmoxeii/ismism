import { Collection, MongoClient } from "https://deno.land/x/mongo@v0.31.1/mod.ts"
import { User } from "../src/typ.ts"

const mongo = new MongoClient()
await mongo.connect("mongodb://127.0.0.1:27017")

console.log(await mongo.database("ismism-dev").listCollectionNames())

const user: Collection<User> = mongo.database("ismism-dev").collection("user")
await user.drop().finally(console.error)
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
console.log(await user.insertMany([
	{ _id: 1, nbr: "18200100001", name: "未明子", utc: Date.now() },
	{ _id: 2, nbr: "18200100002", name: "张正午", utc: Date.now() },
	{ _id: 728, nbr: "18200100003", name: "728", utc: Date.now() },
]))
