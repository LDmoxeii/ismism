echo "building ismism.ts"

rm -rf ui
mkdir ui

cd ismism.ts
cp ui/index.html ../ui/index.html
deno bundle ui/bind.ts ../ui/bind.js
mkdir ../ui/cast
cp ui/cast/index.html ../ui/cast/index.html
cp ui/cast/*.webp ../ui/cast/
deno bundle ui/cast/bind.ts ../ui/cast/bind.js

cd ..
mkdir ui/json
cp json/*.json ui/json/
