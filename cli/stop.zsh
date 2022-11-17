nginx -squit 
curl http://localhost:728/quit
mongosh --eval "db.shutdownServer()"

echo "\nismism stopped\n"
pgrep -lf nginx; pgrep -lf mongo; pgrep -lf "deno run"
