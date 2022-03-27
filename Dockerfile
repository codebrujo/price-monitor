FROM node:14-alpine

USER node

COPY --chown=node:node . /home/node/d2c-poc-iot-finish-tablets-backend

WORKDIR /home/node/d2c-poc-iot-finish-tablets-backend

RUN npm ci

EXPOSE 8080

ENTRYPOINT ["npm", "run", "server"]
