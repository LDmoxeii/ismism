rm -rf target
mkdir target

cp ui/index.html target/index.html

deno bundle src/septem.ts target/septem.js
