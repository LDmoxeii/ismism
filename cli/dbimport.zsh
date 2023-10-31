coll=(usr soc agd cdt dbt ern wsl lit aut)

for c in $coll; do
	echo importing $1/$c.json to ismism.$c 
	mongoimport --jsonArray -d=ismism -c=$c --mode=upsert --file=$1/$c.json
done
