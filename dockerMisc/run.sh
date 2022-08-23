(cd /app && yarn db:gen)
forever start /app/dist/main.js >output.backend 2>&1 &
ws --port 3000 --directory /app/front --spa index.html --rewrite "/api/(.*) -> http://127.0.0.1:3001/api/\$1" >output.frontend 2>&1 &
echo "test" >> output.backend
tail -f output.*
while wait % >/dev/null 2>&1; do : ; done
