echo "building ismism.ts"

rm cli/*.js
rm -rf ui

cd ismism.ts

deno bundle src/ser.ts ../cli/ser.js
deno bundle cli/dbset.ts ../cli/dbset.js

mkdir ../ui

deno bundle ui/bind/bind.ts ui/bind/bind.js
deno run --allow-all ui/ui.ts
