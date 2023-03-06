FROM --platform=x86_64 node:16-bullseye as builder
USER node
WORKDIR /home/node

COPY --chown=node:node . /home/node/.

RUN echo "#!/bin/bash \nls -lah\npwd\npactl list short sources; \nyarn migrate; \nyarn start;" > run.sh
RUN chmod +x run.sh
RUN yarn install --no-progress --frozen-lockfile
RUN yarn build
RUN rm -rf node_modules
RUN yarn install --production --no-progress --frozen-lockfile

FROM --platform=x86_64 node:16-bullseye as runtime

RUN apt update && apt install -y ffmpeg mpv openssl alsa-utils pavucontrol && \
  apt-get clean autoclean && \
  apt-get autoremove --yes && \
  rm -rf /var/lib/{apt,dpkg,cache,log}/

USER node
WORKDIR /home/node

COPY --from=builder --chown=node:node /home/node/covers ./cover
COPY --from=builder --chown=node:node /home/node/prisma ./prisma
COPY --from=builder --chown=node:node /home/node/public ./public
COPY --from=builder --chown=node:node /home/node/.npmrc .
COPY --from=builder --chown=node:node /home/node/next.config.js .
COPY --from=builder --chown=node:node /home/node/package.json .
COPY --from=builder --chown=node:node /home/node/run.sh .
COPY --from=builder --chown=node:node /home/node/.next ./.next
COPY --from=builder --chown=node:node /home/node/node_modules ./node_modules

RUN ls -lah /home/node

EXPOSE 3000
CMD ["bash", "/home/node/run.sh"]
