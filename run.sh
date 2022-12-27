(cd srv && yarn && yarn service:build && yarn start) >output.backend 2>&1 &
(cd ui && yarn start) >output.frontend 2>&1 &
tail -f output.*
while wait % >/dev/null 2>&1; do : ; done
