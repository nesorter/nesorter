# nesorter
### _An attempt to sort and stream music in a convenient way_

## Scruture
```
srv - backend part, exists as a separate nodejs project
ui  - frontend part, exists as a separate nodejs project
```

![Class diagram](https://github.com/nesorter/nesorter/blob/main/readmeAssets/classDiagram_v2.png?raw=true)

## Running in Docker: Easy
0. Look at https://github.com/nesorter/nesorter-docker

## Running in Docker: confusing
0. Download this repo 
```sh
wget https://github.com/nesorter/nesorter/archive/refs/tags/v2.0.9.zip && \
unzip v2.0.9.zip && \
cd nesorter-2.0.9 && \
chmod -R 777 dockerMisc/grafana # grafana will not start if the files in the database are available only to the current user/group
```
1. Fix track library mount path, docker-compose.yml file, line `/Users/kugi/Music:/app/lib`
2. Before starting, you need to prepare an .env file with a configuration.
```sh
cp srv/.env.example srv/.env
```
3. The icecast config is located in `dockerMisc/icecast.xml`, the changes made must be changed accordingly in `srv/.env` (change password or mount name)
4. Building a nesorter image
```sh
docker-compose build api --no-cache --progress plain && \
docker-compose build front --no-cache --progress plain
```
5. Pulling the rest of the images
```sh
docker-compose pull
```
6. Startup (use the -d to "daemonize")
```sh
docker-compose up
```
7. After the launch will be available:
- http://localhost:3000/ - nesorter UI
- http://localhost:8000/ - icecast
- http://localhost:4000/ - grafana (metrics and logs, login/password admin/admin)
8. Monitoring link: http://localhost:4000/d/lZPFzNZVz/new-dashboard?orgId=1&refresh=5s&from=now-1h&to=now&kiosk

## system-wide dependencies [if not planned to run in Docker]
Both parts are written in TypeScript and run in Node.JS. Before installing and running, make sure you have:
- installed `nodejs`
- installed `yarn`; installing it: `npm i -g yarn`

Broadcast work is built on `mpv` and `ffmpeg`. Before using the playback and broadcast functionality, make sure you have:
- installed `mpv` and `ffmpeg`
- in the case when `mpv` and `ffmpeg` are not available in `$PATH`, you should specify the full path to the binary in the `.env` configuration

## Installation [if you are not planning to run in Docker]
1. We call the corresponding script
```sh
./install.sh
```

2. Before starting, you need to prepare an .env file with a configuration.
```sh
cp srv/.env.example srv/.env
```

3. Then you need to edit `srv/.env` by adding the necessary parameters. What each parameter is responsible for look at the end of the README.

4. Important! Database initialization. The step is optional, since in the postinstall script it should already have been completely initialized.
```sh
cd srv && yarn db:gen
```

## Run [if not planned to run in Docker]
You can start `srv` and `ui` via a script:
```sh
./run.sh
```

The commands for manual launch are as follows:
```
cd srv && yarn service:start
cd ui && yarn start
```

## Description of .env [to run in Docker and if not planned to run in Docker]
```
PLAYING_MODE                  - socket or hardware; playback mode - virtual or on a sound card; more stable operation when playing on a sound card
HARDWARE_PLAYER_FFMPEG_DRIVER - how to access the device (alsa/pulse/dshow) https://ffmpeg.org/ffmpeg-devices.html
HARDWARE_PLAYER_FFMPEG_DEVICE - the device itself (e.g. hw:0,1; use `aplay -L` choli) https://ffmpeg.org/ffmpeg-devices.html

ADMIN_TOKEN    - token for admin login
TZ_HOURS_SHIFT - time zone offset

API_LISTEN_PORT - backend port, changing it does not affect the UI part, so there is no point in changing it

MPV_PATH      - path OR name of mpv binary
MPV_FADE_TIME - fade-in/out time (seconds) between tracks [known bug with noise between tracks when value is greater than 0]

CONTENT_ROOT_DIR_PATH - absolute path to the music directory, when running in Docker the value is /app/lib
LOG_PATH              - absolute path to the log file

SHOUT_HOST        - icecast host, set to icecast2 when run in Docker
SHOUT_PORT        - icecast port, when running in Docker, leave the value as in .env.example
SHOUT_USER        - user name (for example, source), when running in Docker, leave the value as in .env.example
SHOUT_PASSWORD    - password from the user, when running in Docker, leave the value as in .env.example
SHOUT_MOUNT       - mount name, when running in Docker, leave the value as in .env.example
SHOUT_URL         - stream url, this info is sent to icecast
SHOUT_DESCRIPTION - stream description, this info is sent to icecast

FFMPEG_BITRATE - stream bitrate
FFMPEG_FORMAT  - format (mp3/ogg) [doesn't seem to work with ogg]
```
