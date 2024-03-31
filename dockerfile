FROM node:lts
WORKDIR /usr/src/app
COPY . .
ENTRYPOINT ["./arranque"]
