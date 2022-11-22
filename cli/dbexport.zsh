echo mongoexport --jsonArray -d=ismism -c=user -o=dbexport/user.json
mongoexport --jsonArray -d=ismism -c=user -o=dbexport/user.json

echo mongoexport --jsonArray -d=ismism -c=soc -o=dbexport/soc.json
mongoexport --jsonArray -d=ismism -c=soc -o=dbexport/soc.json

echo mongoexport --jsonArray -d=ismism -c=agenda -o=dbexport/agenda.json
mongoexport --jsonArray -d=ismism -c=agenda -o=dbexport/agenda.json

echo mongoexport --jsonArray -d=ismism -c=worker -o=dbexport/worker.json
mongoexport --jsonArray -d=ismism -c=worker -o=dbexport/worker.json

echo mongoexport --jsonArray -d=ismism -c=work -o=dbexport/work.json
mongoexport --jsonArray -d=ismism -c=work -o=dbexport/work.json

echo mongoexport --jsonArray -d=ismism -c=fund -o=dbexport/fund.json
mongoexport --jsonArray -d=ismism -c=fund -o=dbexport/fund.json

echo mongoexport --jsonArray -d=ismism -c=dat -o=dbexport/dat.json
mongoexport --jsonArray -d=ismism -c=dat -o=dbexport/dat.json
