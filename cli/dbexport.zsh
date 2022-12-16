rm -rf dbexport

coll=(user soc agenda worker work fund dat)

for c in $coll; do
	echo exporting ismism.$c to dbexport/$c.json
	mongoexport --jsonArray -d=ismism -c=$c -o=dbexport/$c.json
done
