mongosh --eval "db.shutdownServer()"

echo "\nismism stopped\n"
pgrep -lf mongo
