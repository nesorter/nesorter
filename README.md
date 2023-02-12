# nesorter
### _Попытка отсортировать и стримить музыку в удобном виде_

## Структура
```
srv - бекенд часть, существует как отдельный nodejs-проект
ui  - фронтенд часть, существует как отдельный nodejs-проект
```

![Диаграмма классов](https://github.com/nesorter/nesorter/blob/main/readmeAssets/classDiagram_v2.png?raw=true)

## Запуск в Docker: просто
0. Смотрим в репо https://github.com/nesorter/nesorter-docker

## Запуск в Docker: замороченно
0. Скачиваем репо 
```sh
wget https://github.com/nesorter/nesorter/archive/refs/tags/v2.0.9.zip && \
unzip v2.0.9.zip && \
cd nesorter-2.0.9 && \
chmod -R 777 dockerMisc/grafana # графана не запустится если файлы её БД будут доступны толко текущему юзеру/группе
```
1. Поправить путь маунта с библиотекой треков, файл docker-compose.yml, строка `/Users/kugi/Music:/app/lib`
2. Перед запуском нужно подготовить .env-файл с конфигурацией.
```sh
cp srv/.env.example srv/.env
```
3. Конфиг icecast находится в `dockerMisc/icecast.xml`, внесенные изменения нужно соответсвенно изменить в `srv/.env` (смена пароля или имя маунта)
4. Сборка образа nesorter
```sh
docker-compose build api --no-cache --progress plain && \
docker-compose build front --no-cache --progress plain
```
5. Pulling остальных образов
```sh
docker-compose pull
```
6. Запуск (используй ключ -d для "демонизации")
```sh
docker-compose up
```
7. После запуска будут доступны:
- http://localhost:3000/ - nesorter UI
- http://localhost:8000/ - icecast
- http://localhost:4000/ - grafana (метрики и логи, логин/пароль admin/admin)
8. Ссылка на мониторинг логов: http://localhost:4000/d/lZPFzNZVz/new-dashboard?orgId=1&refresh=5s&from=now-1h&to=now&kiosk

## system-wide зависимости [если запуск планируется не в Docker]
Обе части написаны на TypeScript и работают в Node.JS. Перед установкой и запуском убедитесь, что у вас:
- установлен `nodejs`
- установлен `yarn`; его установка: `npm i -g yarn`

Работа вещания построена на `mpv` и `ffmpeg`. Перед использованием функционала проигрывания и вещания убедитесь, что у вас:
- установлены `mpv` и `ffmpeg`
- в случае когда `mpv` и `ffmpeg` недоступны в `$PATH`, следует прописать полный путь до бинарника в конфигурации `.env`

## Установка [если запуск планируется не в Docker]
1. Вызываем соответствующий скрипт 
```sh
./install.sh
```

2. Перед запуском нужно подготовить .env-файл с конфигурацией.
```sh
cp srv/.env.example srv/.env
```

3. После чего нужно отредактировать `srv/.env` прописав нужные параметры. За что отвечает каждый параметр смотреть в конец README.

4. Важно! Инициализация БД. Шаг необязательный, так как в postinstall скрипте оно уже должно было бы полностью заинититься.
```sh
cd srv && yarn db:gen
```

## Запуск [если запуск планируется не в Docker]
Запускать `srv` и `ui` можно через скрипт:
```sh
./run.sh
```

Команды для ручного запуска вот такие:
```
cd srv && yarn service:start
cd ui && yarn start
```

## Описание .env [для запуска в Docker и если запуск планируется не в Docker]
```
PLAYING_MODE                  - socket или hardware; режим воспроизведения -- виртуальный или на звуковой карточке; более стабильная работа при воспроизведении на звуковой карточке
HARDWARE_PLAYER_FFMPEG_DRIVER - чем обращаться к девайсу (alsa/pulse/dshow) https://ffmpeg.org/ffmpeg-devices.html
HARDWARE_PLAYER_FFMPEG_DEVICE - сам девайс (например hw:0,1; юзай `aplay -L` чоли) https://ffmpeg.org/ffmpeg-devices.html

ADMIN_TOKEN           - токен для входа в админку
TZ_HOURS_SHIFT        - смещение часового пояса

API_LISTEN_PORT       - порт бекенда, его изменение не аффектит UI-часть, так что в изменении смысла нет

MPV_PATH              - путь ИЛИ имя бинарника mpv
MPV_FADE_TIME         - время (секунды) fade-in/out между треками [известен баг с нойзом между треками при значении больше 0]

CONTENT_ROOT_DIR_PATH - абсолютный путь до директории с музыкой, при запуске в Docker значение /app/lib
LOG_PATH              - абсолютный путь до файла с логами

SHOUT_HOST            - хост icecast, при запуске в Docker значение icecast2
SHOUT_PORT            - порт icecast, при запуске в Docker значение оставлять как в .env.example
SHOUT_USER            - имя юзера (например source), при запуске в Docker значение оставлять как в .env.example
SHOUT_PASSWORD        - пароль от юзера, при запуске в Docker значение оставлять как в .env.example
SHOUT_MOUNT           - имя маунта, при запуске в Docker значение оставлять как в .env.example
SHOUT_URL             - урл стрима, эта инфа передается в icecast
SHOUT_DESCRIPTION     - описание стрима, эта инфа передается в icecast

FFMPEG_BITRATE        - битрейт потока
FFMPEG_FORMAT         - формат (mp3/ogg) [вроде не работает ogg]
```
