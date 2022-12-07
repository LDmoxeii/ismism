echo "building ismism.ts"

rm cli/*.js
rm -rf ui

mkdir ui

cd ismism.ts

deno bundle src/serve.ts ../cli/serve.js
deno bundle cli/dbinit.ts ../cli/dbinit.js
deno bundle cli/keygen.ts ../cli/keygen.js

cp ui/index.html ../ui/index.html
deno bundle ui/bind.ts ../ui/bind.js

# mkdir ../ui/cast
# cp ui/cast/index.html ../ui/cast/index.html
# cp ui/cast/*.webp ../ui/cast/
# deno bundle ui/cast/bind.ts ../ui/cast/bind.js
