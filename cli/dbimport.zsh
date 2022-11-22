echo mongoimport --jsonArray -d=ismism -c=user --file=dbimport/user.json
mongoimport --jsonArray -d=ismism -c=user --file=dbimport/user.json

echo mongoimport --jsonArray -d=ismism -c=soc --file=dbimport/soc.json
mongoimport --jsonArray -d=ismism -c=soc --file=dbimport/soc.json

echo mongoimport --jsonArray -d=ismism -c=agenda --file=dbimport/agenda.json
mongoimport --jsonArray -d=ismism -c=agenda --file=dbimport/agenda.json

echo mongoimport --jsonArray -d=ismism -c=worker --file=dbimport/worker.json
mongoimport --jsonArray -d=ismism -c=worker --file=dbimport/worker.json

echo mongoimport --jsonArray -d=ismism -c=work --file=dbimport/work.json
mongoimport --jsonArray -d=ismism -c=work --file=dbimport/work.json

echo mongoimport --jsonArray -d=ismism -c=fund --file=dbimport/fund.json
mongoimport --jsonArray -d=ismism -c=fund --file=dbimport/fund.json

echo mongoimport --jsonArray -d=ismism -c=dat --file=dbimport/dat.json
mongoimport --jsonArray -d=ismism -c=dat --file=dbimport/dat.json

mongosh ismism --eval 'db.getCollectionNames().forEach(coll => { 
    const idx = db.getCollection(coll).getIndexes()
    console.log(`${coll}:`)
    printjson(idx)
})'
