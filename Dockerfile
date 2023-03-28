FROM --platform=x86_64 node:16-bullseye as production_dependencies
USER node
WORKDIR /home/node
COPY --chown=node:node . /home/node/.

RUN yarn install --production --no-progress --frozen-lockfile

FROM --platform=x86_64 node:16-bullseye as builder
USER node
WORKDIR /home/node
COPY --chown=node:node . /home/node/.

RUN echo "#!/bin/bash \nls -lah\npwd\npactl list short sources; \nyarn db:migrate; \nyarn start;" > run.sh && \
    chmod +x run.sh && \
    yarn install --no-progress --frozen-lockfile && \
    yarn build

FROM --platform=x86_64 node:16-bullseye as runtime

RUN apt update && apt install -y ffmpeg mpv openssl alsa-utils pavucontrol && \
    apt-get clean autoclean && \
    apt-get autoremove --yes && \
    rm -rf /var/lib/{apt,dpkg,cache,log}/

USER node
WORKDIR /home/node

COPY --from=production_dependencies --chown=node:node /home/node/node_modules ./node_modules
COPY --from=builder --chown=node:node /home/node/covers ./cover
COPY --from=builder --chown=node:node /home/node/prisma ./prisma
COPY --from=builder --chown=node:node /home/node/public ./public
COPY --from=builder --chown=node:node /home/node/.next ./.next
COPY --from=builder --chown=node:node /home/node/.npmrc .
COPY --from=builder --chown=node:node /home/node/next.config.js .
COPY --from=builder --chown=node:node /home/node/package.json .
COPY --from=builder --chown=node:node /home/node/run.sh .

EXPOSE 3000
CMD ["bash", "/home/node/run.sh"]
