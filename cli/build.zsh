echo "building ismism.ts\n"

rm -f cli/*.js

cd ismism.ts

set -e
deno check src/ser.ts
deno run -A cli/bundle.ts src/ser
mv src/ser.js ../cli
