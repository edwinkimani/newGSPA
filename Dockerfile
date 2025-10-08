### Multi-stage Dockerfile for Next.js (App Router)
### Build stage
FROM node:20-bullseye AS builder
WORKDIR /app

# Install dependencies based on package-lock.json for reproducible builds
COPY package*.json ./
COPY package-lock.json ./
RUN npm ci --no-audit --prefer-offline

# Install ts-node for seeding
RUN npm install -g ts-node

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the project and build
COPY . .
RUN npm run build

### Production image
FROM node:20-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install ts-node globally for seeding
RUN npm install -g ts-node

# Copy built artifacts and dependencies
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy Prisma files and generated client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy seed file
COPY --from=builder /app/prisma/seeders ./prisma/seeders

# Set proper permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

EXPOSE 3000

# Use the standard Next start
CMD ["npm", "start"]