# nesorter
### _An attempt to sort and stream music in a convenient way_

## Structure
![Class diagram](https://github.com/nesorter/nesorter/blob/main/readmeAssets/classDiagram_v2.png?raw=true)

## Playback mechanism
![Scheme](https://github.com/nesorter/nesorter/blob/main/readmeAssets/play_mode_scheme.png?raw=true)

## a. Running in Docker: Easy
0. Look at https://github.com/nesorter/nesorter-docker

## b. Manual run: System-wide dependencies
Project are written in TypeScript and run in Node.JS. Before installing and running, make sure you have:
- installed `nodejs`
- installed `yarn`; installing it: `npm i -g yarn`

Broadcast work is built on `mpv` and `ffmpeg`. Before using the playback and broadcast functionality, make sure you have:
- installed `mpv` and `ffmpeg`
- in the case when `mpv` and `ffmpeg` are not available in `$PATH`, you should specify the full path to the binary in the `.env` configuration

## b. Manual run: Installation
0. We call the corresponding script
```shell
git clone https://github.com/nesorter/nesorter.git && \
cd nesorter && \
yarn install
```

1. Before starting, you need to prepare an .env file with a configuration.
```shell
cp .env.example .env
```

2. Then you need to edit `.env` by adding the necessary parameters. What each parameter is responsible for look at the end of the README.

3. Important! Database initialization.
```shell
yarn db:migrate
```

4. Build project:
```shell
yarn build
```

## b. Manual run: Start app
You can start via a script:
```shell
yarn start
```

## Description of .env
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

SHOUT_ADMIN_USER     - username of icecast admin user
SHOUT_ADMIN_PASSWORD - password of icecast admin user

FFMPEG_BITRATE - stream bitrate
FFMPEG_FORMAT  - format (mp3/ogg) [doesn't seem to work with ogg]
```
