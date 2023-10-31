mkdir -p db
rm -rf log; mkdir log

if systemctl > /dev/null; then
	cp -f mongod.service /lib/systemd/system/
	systemctl daemon-reload
	systemctl start mongod
else
	nohup mongod --config mongod.yaml > log/mongod.log &
fi

sleep 3.0

nohup deno run --allow-net --allow-read cli/ser.js 728 > log/ismism728.log &
nohup deno run --allow-net --allow-read cli/ser.js 729 > log/ismism729.log &
nohup nginx -p . -c nginx.conf > log/nginx.log &

sleep 0.5

tail log/mongo.log log/access.log log/error.log log/nginx.log log/mongod.log log/ismism{728,729}.log
echo "\nismism started\n"
pgrep -lf nginx; pgrep -lf mongo; pgrep -lf "deno run"
