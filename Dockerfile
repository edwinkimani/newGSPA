### Multi-stage Dockerfile for Next.js (App Router)
### Build stage
FROM node:20-bullseye AS builder
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm ci --no-audit --prefer-offline --ignore-scripts

# Install build dependencies
RUN npm install --save-dev ts-node typescript @types/node

# Copy Prisma and generate client
COPY prisma ./prisma/
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

# Copy only what's needed for production
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Copy Next.js config if it exists
COPY --from=builder --chown=nextjs:nodejs /app/next.config.mjs ./next.config.mjs
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json

# Set permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["npm", "start"]