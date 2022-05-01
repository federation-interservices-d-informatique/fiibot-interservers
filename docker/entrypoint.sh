#!/usr/bin/env sh
set -e
DIR="$(realpath "$(dirname "${0}")")"

until PGPASSWORD="${POSTGRES_PASSWORD}" psql -h "${DB_HOST}" -U "${POSTGRES_USER}" -c '\q' 2>/dev/null
do
    echo "PostgreSQL is starting... Waiting"
    sleep 1
done

echo "- Running prisma migrations"
./node_modules/.bin/prisma migrate deploy > "/tmp/migrations.log" 2>&1
echo "- Finished running migrations"

node "${DIR}/dist/index.js"
