# nesorter
### _Попытка отсортировать и стримить музыку в удобном виде_

## Структура
```
srv - бекенд часть, существует как отдельный nodejs-проект
ui  - фронтенд часть, существует как отдельный nodejs-проект
```

![Диаграмма классов](https://github.com/nesorter/nesorter/blob/main/readmeAssets/classDiagram.png?raw=true)

## system-wide зависимости
Обе части написаны на TypeScript и работают в Node.JS. Перед установкой и запуском убедитесь, что у вас:
- установлен `nodejs`
- установлен `yarn`; его установка: `npm i -g yarn`

Работа вещания построена на `mpv` и `ffmpeg`. Перед использованием функционала проигрывания и вещания убедитесь, что у вас:
- установлены `mpv` и `ffmpeg`
- в случае когда `mpv` и `ffmpeg` недоступны в `$PATH`, следует прописать полный путь до бинарника в конфигурации `.env`

Хранение данных бекенд-части произоводится в СУБД `sqlite`, средствами ORM `prisma`. Перед запуском убедитесь, что у вас:
- установлен `sqlite`

## Установка
1. Для бекенд и фронтенд частей нужно делать отдельные установки зависимостей:
```sh
cd srv && yarn
cd ../ui && yarn
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

## Запуск
Запускать `srv` и `ui` можно как удобно, но команды запуска вот такие:
```
cd srv && yarn service:start
cd ui && yarn start
```

## Описание .env
```
API_LISTEN_PORT       - порт бекенда, его изменение не аффектит UI-часть, так что в изменении смысла нет

MPV_PATH              - путь ИЛИ имя бинарника mpv
MPV_FADE_TIME         - время (секунды) fade-in/out между треками

CONTENT_ROOT_DIR_PATH - абсолютный путь до директории с музыкой
LOG_PATH              - абсолютный путь до файла с логами

SHOUT_HOST            - хост icecast
SHOUT_PORT            - порт icecast
SHOUT_USER            - имя юзера (например source)
SHOUT_PASSWORD        - пароль от юзера
SHOUT_MOUNT           - имя маунта
SHOUT_URL             - урл стрима, эта инфа передается в icecast
SHOUT_DESCRIPTION     - описание стрима, эта инфа передается в icecast

FFMPEG_BITRATE        - битрейт потока
FFMPEG_DRIVER         - чем обращаться к девайсу (alsa/pulse/dshow) https://ffmpeg.org/ffmpeg-devices.html
FFMPEG_DEVICE         - сам девайс (например hw:0,1) https://ffmpeg.org/ffmpeg-devices.html
FFMPEG_FORMAT         - формат (mp3/ogg)
```
