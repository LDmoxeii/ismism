coll=(usr soc agd ord work fund dst act aut wsl lit)

for c in $coll; do
	echo importing $1/$c.json to ismism.$c 
	mongoimport --jsonArray -d=ismism -c=$c --mode=upsert --file=$1/$c.json
done
