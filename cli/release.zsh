rm -rf release
git clone --depth 1 git@gitlab.com:728/ismism.git release
rm -rf release/.git

zsh cli/build.zsh
cp -r ui release

mv release/nginx.ssl.conf release/nginx.conf
cp -r ssl release

if [ "$1" = "dbimport" ]; then 
	echo "cp -r dbimport release"
	cp -r dbimport release
fi

rm -f ismism.zip
cd release
zip -r ../ismism.zip .
cd ..
scp -i ~/work/ismism/72eight.pem -r ismism.zip root@43.154.15.138:/root/
scp -i ~/work/ismism/72eight.pem -r cli/deploy.zsh root@43.154.15.138:/root/
