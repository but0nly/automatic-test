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

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN pnpm run build

# Stage 2: Run
FROM m.daocloud.io/docker.io/library/node:20-alpine AS runner
WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable pnpm

ENV NODE_ENV=production
ENV PORT=3001

# Only copy necessary files for runtime to keep image small
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001
# Run the application using pnpm
CMD ["sh", "-c", "npx prisma migrate deploy && pnpm run start"]
