### Multi-stage Dockerfile for Next.js (App Router)
### Build stage
FROM node:20-bullseye AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY package-lock.json ./
RUN npm ci --no-audit --prefer-offline --ignore-scripts

# Install additional dependencies for build
RUN npm install --save-dev ts-node typescript @types/node

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the project and build
COPY . .
RUN npm run build

# Compile seed script for production
RUN npx tsc prisma/seeders/seed.ts --outDir dist --target es2020 --module commonjs --esModuleInterop

### Production image
FROM node:20-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built artifacts and dependencies
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Copy Prisma files and generated client
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Copy compiled seed file
COPY --from=builder --chown=nextjs:nodejs /app/dist/prisma/seeders/seed.js ./prisma/seeders/

# Copy necessary config files
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./

# Set proper permissions
RUN chown -R nextjs:nodejs /app && \
    chmod -R 755 /app

# Switch to non-root user
USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Use the standard Next start
CMD ["npm", "start"]