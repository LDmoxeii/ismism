echo "building ismism.ts\n"

rm -f ../cli/*.js
rm -rf ../ui; mkdir ../ui

set -e
deno check src/ser.ts ui/bind/bind.ts
deno run -A cli/bundle.ts src/ser ui/bind/bind
deno run -A ui/ui.ts

mv src/ser.js ../cli