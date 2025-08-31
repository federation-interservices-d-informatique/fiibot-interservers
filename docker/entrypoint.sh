#!/usr/bin/env sh
set -e
DIR="$(realpath "$(dirname "${0}")")"

until PGPASSWORD="${POSTGRES_PASSWORD}" psql -h "${DB_HOST}" -U "${POSTGRES_USER}" -c '\q' -d "${POSTGRES_DB}" 2>/dev/null
do
    echo "PostgreSQL is starting... Waiting"
    sleep 1
done

echo "- Running prisma migrations"
bun run prisma migrate deploy > "/tmp/migrations.log" 2>&1
echo "- Finished running migrations"

bun "src/index.ts"
