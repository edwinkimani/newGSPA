### Multi-stage Dockerfile for Next.js (App Router)
### Build stage
FROM node:20-bullseye AS builder
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY package-lock.json ./

# Install ALL dependencies
RUN npm ci --no-audit --prefer-offline

# Copy Prisma and generate client
COPY prisma/ ./prisma/
RUN npx prisma generate

# Copy source code and build
COPY . .
RUN npm run build

### Production image
FROM node:20-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application and runtime dependencies
COPY --from=builder --chown=nextjs:nodejs /app/public/ ./public/
COPY --from=builder --chown=nextjs:nodejs /app/.next/ ./.next/
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./

# Copy only necessary node_modules for production and migrations
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/ ./node_modules/

# Copy Prisma schema and generated client
COPY --from=builder --chown=nextjs:nodejs /app/prisma/ ./prisma/
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma/ ./node_modules/.prisma/
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/ ./node_modules/@prisma/

# Copy Prisma CLI specifically
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma/ ./node_modules/prisma/

# Copy tsx if needed for seeding
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/tsx/ ./node_modules/tsx/

# Copy necessary config files
COPY --from=builder --chown=nextjs:nodejs /app/next.config.mjs ./
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./

# Set permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/ > /dev/null 2>&1 || exit 1

# Start the application with migrations
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]