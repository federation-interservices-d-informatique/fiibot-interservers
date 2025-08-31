#!/usr/bin/env sh
set -e

until PGPASSWORD="${POSTGRES_PASSWORD}" psql -h "${DB_HOST}" -U "${POSTGRES_USER}" -c '\q' 2>/dev/null
do
    echo "PostgreSQL is starting... Waiting"
    sleep 1
done
bun run migrate:dev
bun watch src/index.ts