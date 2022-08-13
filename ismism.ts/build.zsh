echo "building $1"

rm -rf target
mkdir target

cp ui/index.html target/index.html
cp ui/1-0.jpg target/1-0.jpg
deno bundle ui/bind.ts target/bind.js

