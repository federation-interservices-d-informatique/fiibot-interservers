FROM node:18-alpine3.17 as build
WORKDIR /app/bot

COPY ./src ./src
COPY ./prisma ./prisma
COPY ./*.json ./
COPY ./docker/entrypoint.sh ./

RUN npm install
RUN npx tsc
RUN npx prisma generate

FROM node:18-alpine3.14 as prod
WORKDIR /usr/src/bot
RUN apk update && \
    apk add --no-cache postgresql
RUN adduser -D -H bot bot

COPY --from=build --chown=bot:bot /app/bot/package.json ./package.json
COPY --from=build --chown=bot:bot /app/bot/package-lock.json ./package-lock.json
RUN npm ci --production

COPY --from=build --chown=bot:bot /app/bot/dist ./dist
COPY --from=build --chown=bot:bot /app/bot/prisma ./prisma
COPY --from=build --chown=bot:bot /app/bot/node_modules/@prisma/client/ ./node_modules/@prisma/client/
COPY --from=build --chown=bot:bot /app/bot/node_modules/.prisma/client/ ./node_modules/.prisma/client/
COPY --from=build --chown=bot:bot /app/bot/entrypoint.sh ./

USER bot

ENV NODE_ENV production
ENTRYPOINT [ "/usr/src/bot/entrypoint.sh" ]
