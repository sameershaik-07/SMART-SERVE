# ==========================================
# SMART-SERVE Backend Production Dockerfile
# ==========================================
FROM node:20-alpine AS base

# Install openssl for Prisma Client on Alpine
RUN apk add --no-cache openssl wget

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --omit=dev

# Generate Prisma Client
RUN npx prisma generate

# Copy source code and scripts
COPY src ./src/
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Environment settings
ENV NODE_ENV=production
ENV PORT=3000

# Expose backend API and WebSocket port
EXPOSE 3000

# Container healthcheck
HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "src/server.js"]

