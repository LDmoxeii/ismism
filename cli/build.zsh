echo "building ismism.ts"

rm cli/*.js
rm -rf ui

cd ismism.ts

deno bundle cli/dbreset.ts ../cli/dbreset.js
