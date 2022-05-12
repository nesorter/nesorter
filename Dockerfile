FROM node:lts-bullseye as runner
RUN apt update && apt install -y cmake libshout3 libshout3-dev libasound2-dev
WORKDIR /nesorter-api-deps
COPY package.json yarn.lock ./
RUN yarn --ignore-optional --non-interactive --verbose
COPY . .

EXPOSE 3001

CMD [ "yarn", "run", "service:start" ]