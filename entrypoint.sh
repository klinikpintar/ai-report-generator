#!/bin/sh

echo "⏳ Running Prisma Migrate..."
npx prisma migrate deploy

# Pass the other arguments to the application
exec "$@"
