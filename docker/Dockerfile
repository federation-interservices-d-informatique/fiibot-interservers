FROM node:24-alpine3.22 as build
WORKDIR /app/bot

COPY ./src ./src
COPY ./prisma ./prisma
COPY ./*.json ./
COPY ./docker/entrypoint.sh ./
COPY ./docker/healthcheck.sh ./

RUN npm install
RUN npx tsc
RUN npx prisma generate

FROM node:24-alpine3.22 as prod
WORKDIR /usr/src/bot
RUN apk update && \
    apk add --no-cache postgresql curl
RUN adduser -D -H bot bot

COPY --from=build --chown=bot:bot /app/bot/package.json ./package.json
COPY --from=build --chown=bot:bot /app/bot/package-lock.json ./package-lock.json
RUN npm ci --production

COPY --from=build --chown=bot:bot /app/bot/dist ./dist
COPY --from=build --chown=bot:bot /app/bot/prisma ./prisma
COPY --from=build --chown=bot:bot /app/bot/node_modules/@prisma/client/ ./node_modules/@prisma/client/
COPY --from=build --chown=bot:bot /app/bot/node_modules/.prisma/client/ ./node_modules/.prisma/client/
COPY --from=build --chown=bot:bot /app/bot/entrypoint.sh ./
COPY --from=build --chown=bot:bot /app/bot/healthcheck.sh ./

USER bot

ENV NODE_ENV production

HEALTHCHECK --interval=1m --timeout=10s --start-period=5s --retries=3 \
    CMD [ "/usr/src/bot/healthcheck.sh" ]
ENTRYPOINT [ "/usr/src/bot/entrypoint.sh" ]
