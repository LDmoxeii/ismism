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

nginx -sreopen; tail -n 10 log/{access,error,ismism}.log
pgrep -lf nginx; pgrep -lf mongo; pgrep -lf "deno run"

echo "\nismism released\n"
