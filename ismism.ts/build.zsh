echo "building $1"

rm -rf target
mkdir target

cp ui/index.html target/index.html
deno bundle ui/bind.ts target/bind.js

