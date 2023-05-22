mkdir -p db
rm -rf log; mkdir log

if systemctl > /dev/null; then
	cp -f mongod.service /lib/systemd/system/
	systemctl daemon-reload
	systemctl start mongod
else
	nohup mongod --config mongod.yaml > log/mongod.log &
fi

echo "\nismism started\n"
pgrep -lf mongo
