rm -rf log; mkdir log

zsh cli/db.zsh

curl "http://localhost:728/quit"
sleep 0.5

deno run --allow-net --allow-read src/ser.ts