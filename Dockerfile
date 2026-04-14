# Stage 1: Build
FROM m.daocloud.io/docker.io/library/node:20-alpine AS builder
WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable pnpm

# Copy package.json, pnpm-lock.yaml and .npmrc (for registry mirror)
COPY package.json pnpm-lock.yaml .npmrc ./

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

COPY . .

ARG DATABASE_URL
ARG REDIS_URL
ENV DATABASE_URL=$DATABASE_URL
ENV REDIS_URL=$REDIS_URL

# Generate Prisma client
RUN npx prisma generate

# Ensure database schema exists for the build process (Next.js static generation)
RUN npx prisma migrate deploy

# Build the application
RUN pnpm run build

# Stage 2: Run
FROM m.daocloud.io/docker.io/library/node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Only copy necessary files for runtime to keep image small
# In standalone mode, Next.js bundles everything into .next/standalone
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001
# Run the application using the standalone server.js
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
