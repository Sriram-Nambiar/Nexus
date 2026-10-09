# ===================================================
# NEXUS AI Backend - Multi-Stage Production Dockerfile
# ===================================================

# Stage 1: Build & Compile TypeScript
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Install native compilation dependencies for SQLite bindings
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package manifests first for efficient layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy TypeScript configuration and source files
COPY tsconfig.json ./
COPY src/ ./src/

# Compile TypeScript to JavaScript in /app/dist
RUN npm run build

# Stage 2: Production Runtime
FROM node:22-bookworm-slim AS runner

WORKDIR /app

# Install runtime dependencies for SQLite
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0
ENV ENABLE_LAN_ACCESS=true
ENV DB_PATH=/app/data/nexus.sqlite
ENV UPLOAD_DIR=/app/data/uploads
ENV AI_SERVICE_URL=http://ai-service:8000
ENV AI_MOCK_FALLBACK=true

# Copy package manifests and install production-only dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled JavaScript from builder
COPY --from=builder /app/dist ./dist

# Create persistent storage directories
RUN mkdir -p /app/data/uploads

# Expose port 5000 for local network / Kiwix hotspot devices
EXPOSE 5000

# Health check to ensure service readiness
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "const http = require('http'); http.get('http://127.0.0.1:5000/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

# Launch NEXUS backend server
CMD ["node", "dist/server.js"]
