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
curl http://localhost:729/quit
nohup deno run --allow-net --allow-read cli/ser.js 728 > log/ismism728.log &
nohup deno run --allow-net --allow-read cli/ser.js 729 > log/ismism729.log &

nginx -sreopen; 
tail -n 10 log/{access,error}.log log/ismism{728,729}.log
pgrep -lf nginx; pgrep -lf mongo; pgrep -lf "deno run"

echo "\nismism released\n"
