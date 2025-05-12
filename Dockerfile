# Stage 1: Install dependencies
FROM node:20-alpine AS deps

ENV PNPM_VERSION=8.15.4
RUN corepack enable && corepack prepare pnpm@$PNPM_VERSION --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: Build application
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

# Stage 3: Production image
FROM node:20-alpine AS runner

ENV PNPM_VERSION=8.15.4
ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@$PNPM_VERSION --activate

WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Copy entrypoint script
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]

CMD ["pnpm", "start"]
