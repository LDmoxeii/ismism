rm -rf ismism/cli
rm -rf ismism/ui
rm -rf ismism/dbimport

sleep 1
unzip -o ismism.zip -d ismism

mkdir -p ismism-old
mv ismism.zip  "ismism-old/ismism-$(date +%Y%m%d-%H%M).zip"
