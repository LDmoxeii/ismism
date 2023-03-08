ssh i zsh < cli/dbexport.zsh

rm -rf dbexport
scp -r i:dbexport dbexport

cd dbexport
zip -r ~/work/ismism/dbexport/dbexport-$(date +%Y%m%d-%H%M).zip .
cd ..

deno run -A cli/dbset.js
zsh cli/dbimport.zsh dbexport
