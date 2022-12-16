coll=(user soc agenda worker work fund dat)

for c in $coll; do
	echo importing $1/$c.json to ismism.$c 
	mongoimport --jsonArray -d=ismism -c=$c --mode=upsert --file=$1/$c.json
done

mongosh ismism --eval 'db.getCollectionNames().forEach(coll => { 
    const idx = db.getCollection(coll).getIndexes()
    console.log(`${coll}:`)
    printjson(idx)
})'
