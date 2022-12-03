rm -rf release
git clone --depth 1 git@gitlab.com:728/ismism.git release
rm -rf release/.git

zsh cli/build.zsh

cp -r ui release
cp -r ssl release
cp jwk.json release

if [ "$1" = "dbimport" ]; then 
	echo "cp -r dbimport release"
	cp -r dbimport release
fi

rm -f ismism.zip
cd release
zip -r ../ismism.zip .
cd ..
scp ismism.zip i:/root

ssh i zsh < cli/deploy.zsh


