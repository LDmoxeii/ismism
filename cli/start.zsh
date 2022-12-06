rm -rf log; mkdir log

if systemctl > /dev/null; then
	cp -f mongod.service /lib/systemd/system/
	systemctl daemon-reload
	systemctl start mongod
else
	nohup mongod --config mongod.yaml > log/mongod.log &
fi

sleep 3.0

nohup deno run --allow-net --allow-read ismism.ts/src/serve.ts > log/ismism.log &
nohup nginx -p . -c nginx.conf > log/nginx.log &

sleep 0.5

tail log/mongo.log log/access.log log/error.log log/nginx.log log/mongod.log log/ismism.log
echo "\nismism started\n"
pgrep -lf nginx; pgrep -lf mongo; pgrep -lf "deno run"
