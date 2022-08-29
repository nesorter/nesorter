#!/bin/bash

echo "start app" >> output.backend
(cd /app && yarn db:gen)

node /app/dist/main.js >output.backend 2>&1 &
tail -f output.*
while wait % >/dev/null 2>&1; do : ; done
