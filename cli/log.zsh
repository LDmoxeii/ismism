ssh i "goaccess ismism/log/access.log -o ismism/log/access.html --log-format=COMBINED"
scp i:ismism/log/access.html log
open log/access.html
