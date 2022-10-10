#!/bin/bash

echo "pulse devices"
pactl list short sources

echo "start app" >> output.backend
(cd /home/node && yarn db:gen)

node /home/node/dist/main.js >output.backend 2>&1 &
tail -f output.*
while wait % >/dev/null 2>&1; do : ; done
