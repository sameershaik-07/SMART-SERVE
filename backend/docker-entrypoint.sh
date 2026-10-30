#!/bin/sh
set -e

echo "--> Running database migrations (prisma migrate deploy)..."
npx prisma migrate deploy

if [ "$RUN_SEED" = "true" ]; then
  echo "--> Running database seed (node prisma/seed.js)..."
  node prisma/seed.js || true
fi

echo "--> Starting SMART-SERVE Backend..."
exec "$@"

