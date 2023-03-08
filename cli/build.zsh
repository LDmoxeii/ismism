echo "building ismism.ts"

rm cli/*.js
rm -rf ui

mkdir ui

cd ismism.ts

deno bundle src/ser.ts ../cli/ser.js
deno bundle cli/dbset.ts ../cli/dbset.js
deno bundle ui/bind/bind.ts ui/bind/bind.js

deno run -A ui/ui.ts
