rm -rf dbexport

coll=(usr soc agd ord work fund act aut wsl lit)

for c in $coll; do
	echo exporting ismism.$c to dbexport/$c.json
	mongoexport --jsonArray -d=ismism -c=$c -o=dbexport/$c.json
done
