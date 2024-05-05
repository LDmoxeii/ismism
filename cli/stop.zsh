nginx -squit
mongod --shutdown
mongosh --eval "db.shutdownServer()"  
# curl "http://localhost:728/quit"
