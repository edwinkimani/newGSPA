## Multi-stage Dockerfile for Next.js production build
## Builds the app then creates a slim runtime image

FROM node:20-bullseye AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --no-audit --prefer-offline

# ✅ Copy full source code including prisma/schema.prisma
COPY . .

# ✅ Generate Prisma client AFTER schema is available
RUN npx prisma generate

# Build Next.js app
RUN npm run build

## Runtime image
FROM node:20-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built app and public assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev --no-audit --prefer-offline

EXPOSE 3000

# Use the standard Next start script
CMD ["npm", "start"]
