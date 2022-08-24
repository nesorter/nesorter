echo "Starting Xvfb"
# Виртуальный X11-сервер для работоспособности electron (оно нужно для waveform, просто это самый быстрый способ вычислить десятки миллионов циферок в случае nesorter)
Xvfb :0 &
sleep 2

echo "start app" >> output.backend
(cd /app && yarn db:gen)

export DISPLAY=:0

node /app/dist/main.js >output.backend 2>&1 &
tail -f output.*
while wait % >/dev/null 2>&1; do : ; done
