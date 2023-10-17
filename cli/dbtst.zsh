mongosh --eval "db.shutdownServer()"
sleep 0.5
nohup mongod --config mongod.yaml > log/mongod.log &
sleep 0.5
