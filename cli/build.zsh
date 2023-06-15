echo "building ismism.ts\n"

rm -f cli/*.js
rm -rf ui
mkdir ui
mkdir ui/cast

cd ismism.ts
rm -f ui/bind/*.js
rm -f ui/cast/*.js

set -e
deno check src/ser.ts cli/dbset.ts ui/bind/bind.ts ui/cast/bind.ts
deno run -A cli/bundle.ts src/ser cli/dbset ui/bind/bind ui/cast/bind
deno run -A ui/ui.ts

mv src/ser.js ../cli
mv cli/dbset.js ../cli
