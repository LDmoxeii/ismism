echo "building ismism.ts\n"

rm -f cli/*.js
rm -rf ui
mkdir ui

cd ismism.ts

set -e
deno check src/ser.ts
deno run -A cli/bundle.ts src/ser ui/bind/bind
deno run -A ui/ui.ts
mv src/ser.js ../cli
