ssh i zsh < cli/dbexport.zsh

rm -rf dbexport
scp -r i:dbexport dbexport

deno run --allow-all cli/dbinit.js

zsh cli/dbimport.zsh dbexport

cd dbexport
zip -r ~/work/ismism/dbexport/dbexport-$(date +%Y%m%d-%H%M).zip .
