#!/bin/bash

echo "pulse devices"
pactl list short sources

echo "start app" >> output.backend
(cd /home/node && yarn db:gen)

yarn start >output.backend 2>&1 &
tail -f output.*
while wait % >/dev/null 2>&1; do : ; done
