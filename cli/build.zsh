echo "building ismism.ts"

rm cli/*.js
rm -rf ui

cd ismism.ts

deno bundle src/ser.ts ../cli/ser.js
deno bundle cli/dbset.ts ../cli/dbset.js
