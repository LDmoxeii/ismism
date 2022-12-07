rm -rf ismism/cli
rm -rf ismism/ui

sleep 1
unzip -o ismism.zip -d ismism

mkdir -p ismism-old
mv ismism.zip  "ismism-old/ismism-$(date +%Y%m%d-%H%M).zip"
