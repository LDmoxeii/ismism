echo "building ismism.ts"

rm cli/*.js
rm -rf ui

cd ismism.ts

deno bundle src/serve.ts ../cli/serve.js
deno bundle cli/dbreset.ts ../cli/dbreset.js
