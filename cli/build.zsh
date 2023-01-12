echo "building ismism.ts"

rm cli/*.js
rm -rf ui

mkdir ui
mkdir ui/54

cd ismism.ts

deno bundle src/serve.ts ../cli/serve.js
deno bundle cli/dbreset.ts ../cli/dbreset.js
deno bundle cli/smstst.ts ../cli/smstst.js

cp ui/index.html ../ui/index.html
deno bundle ui/bind.ts ../ui/bind.js

cp ui/54/index.html ../ui/54/index.html
cp ui/54/v1.pdf ../ui/54/v1.pdf

# mkdir ../ui/cast
# cp ui/cast/index.html ../ui/cast/index.html
# cp ui/cast/*.webp ../ui/cast/
# deno bundle ui/cast/bind.ts ../ui/cast/bind.js
