#!/bin/sh

echo "⏳ Running Prisma Migrate..."
npx prisma migrate deploy

echo "🌱 Running Prisma Seed..."
npx prisma db seed

# Pass the other arguments to the application
exec "$@"
