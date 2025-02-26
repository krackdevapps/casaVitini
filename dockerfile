FROM node:lts
WORKDIR /usr/src/app
COPY . .
CMD "node casaVitini.mjs"
