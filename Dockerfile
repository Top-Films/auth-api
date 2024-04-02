FROM --platform=linux/arm64 node:20.12.0-alpine as build

USER root

WORKDIR /app

EXPOSE 8080

ENV NODE_ENV production

COPY dist/ dist/
COPY package.json .

RUN npm install --omit=dev
RUN chown -R node:node /app

USER node

CMD ["node", "dist/index.js"]