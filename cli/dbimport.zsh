echo mongoimport --jsonArray -d=ismism -c=user --mode=upsert --file=dbimport/user.json
mongoimport --jsonArray -d=ismism -c=user --mode=upsert --file=dbimport/user.json

echo mongoimport --jsonArray -d=ismism -c=soc --mode=upsert --file=dbimport/soc.json
mongoimport --jsonArray -d=ismism -c=soc --mode=upsert --file=dbimport/soc.json

echo mongoimport --jsonArray -d=ismism -c=agenda --mode=upsert --file=dbimport/agenda.json
mongoimport --jsonArray -d=ismism -c=agenda --mode=upsert --file=dbimport/agenda.json

echo mongoimport --jsonArray -d=ismism -c=worker --mode=upsert --file=dbimport/worker.json
mongoimport --jsonArray -d=ismism -c=worker --mode=upsert --file=dbimport/worker.json

echo mongoimport --jsonArray -d=ismism -c=work --mode=upsert --file=dbimport/work.json
mongoimport --jsonArray -d=ismism -c=work --mode=upsert --file=dbimport/work.json

echo mongoimport --jsonArray -d=ismism -c=fund --mode=upsert --file=dbimport/fund.json
mongoimport --jsonArray -d=ismism -c=fund --mode=upsert --file=dbimport/fund.json

echo mongoimport --jsonArray -d=test -c=dat --mode=upsert --file=dbimport/dat.json
mongoimport --jsonArray -d=ismism -c=dat --mode=upsert --file=dbimport/dat.json

mongosh ismism --eval 'db.getCollectionNames().forEach(coll => { 
    const idx = db.getCollection(coll).getIndexes()
    console.log(`${coll}:`)
    printjson(idx)
})'
