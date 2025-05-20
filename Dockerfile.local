# Stage 1: Install dependencies
FROM node:20-alpine AS deps

ENV PNPM_VERSION=8.15.4
RUN corepack enable && corepack prepare pnpm@$PNPM_VERSION --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: Build the app
FROM node:20-alpine AS builder

ENV PNPM_VERSION=8.15.4
RUN corepack enable && corepack prepare pnpm@$PNPM_VERSION --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/pnpm-lock.yaml ./
COPY package.json ./
COPY . .

RUN pnpm prisma generate
RUN pnpm build

# Stage 3: Final production image
FROM node:20-alpine AS runner

ENV PNPM_VERSION=8.15.4
ENV NODE_ENV=production

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@$PNPM_VERSION --activate

# Copy standalone app (includes server.js and necessary node_modules)
COPY --from=builder /app/.next/standalone ./

# Copy static files and public assets
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy prisma schema/migrations
COPY --from=builder /app/prisma ./prisma

# Copy entrypoint script
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "server.js"]
