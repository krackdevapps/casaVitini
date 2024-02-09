FROM node:lts
WORKDIR /usr/src/app
COPY . .
CMD ["sh", "-c", "node casaVitini.mjs"]
CMD ["sh", "-c", "rm .env"]
