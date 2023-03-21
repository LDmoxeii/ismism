source .zshrc
rm -rf ismism/cli
rm -rf ismism/ui/index.html
rm -rf ismism/dbimport

sleep 1
unzip -o ismism.zip -d ismism

mkdir -p ismism-old
mv ismism.zip  "ismism-old/ismism-$(date +%Y%m%d-%H%M).zip"
cd ismism

curl http://localhost:728/quit
nohup deno run --allow-net --allow-read cli/ser.js > log/ismism.log &

tail log/mongo.log log/access.log log/error.log log/nginx.log log/mongod.log log/ismism.log
echo "\nismism released\n"
pgrep -lf nginx; pgrep -lf mongo; pgrep -lf "deno run"
