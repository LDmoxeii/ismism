zsh cli/build.zsh

rm -rf release
mkdir release

cp -r cli release
cp -r ui release
cp -r ssl release
cp jwk.json tc.json mongod.service mongod.yaml nginx.conf release

if [ "$1" = "dbimport" ]; then 
	echo "cp -r dbimport release"
	cp -r dbimport release
fi

rm -f ismism.zip
cd release
zip -r ../ismism.zip .
cd ..
scp ismism.zip i:

ssh i zsh < cli/remote/deploy.zsh
