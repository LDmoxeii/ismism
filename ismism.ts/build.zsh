echo "building $1"

rm -rf target
mkdir target

# cp ui/index.html target/index.html
# deno bundle ui/bind.ts target/bind.js

mkdir target/cast
cp ui/cast/index.html target/cast/index.html
cp ui/cast/*.webp target/cast/
deno bundle ui/cast/bind.ts target/cast/bind.js
