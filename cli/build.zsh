echo "building ismism.ts\n"

rm -f cli/*.js
rm -rf ui
mkdir ui

cd ismism.ts
rm -f ui/bind/*.js

set -e
deno check src/ser.ts cli/dbset.ts ui/bind/bind.ts
deno run -A cli/bundle.ts src/ser cli/dbset ui/bind/bind
deno run -A ui/ui.ts

mv src/ser.js ../cli
mv cli/dbset.js ../cli
