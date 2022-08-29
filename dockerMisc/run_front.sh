#!/bin/bash

echo "start front" >> output.front
ws --port 3000 --directory /app/build --spa index.html --rewrite "/api/(.*) -> http://api:3001/api/\$1" >output.frontend 2>&1 &
tail -f output.*
while wait % >/dev/null 2>&1; do : ; done
