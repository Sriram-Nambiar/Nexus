# ===================================================
# NEXUS AI Backend - Multi-Stage Production Dockerfile
# ===================================================

# Stage 1: Build & Compile TypeScript
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Copy package manifest
COPY package.json ./

# Install all dependencies including devDependencies for compilation
RUN npm install

# Copy TypeScript configuration and source files
COPY tsconfig.json ./
COPY src/ ./src/

# Compile TypeScript to JavaScript in /app/dist
RUN npm run build

# Stage 2: Production Runtime
FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0
ENV ENABLE_LAN_ACCESS=true
ENV DB_PATH=/app/data/nexus.sqlite
ENV UPLOAD_DIR=/app/data/uploads
ENV AI_SERVICE_URL=http://ai-service:8000
ENV AI_MOCK_FALLBACK=true

# Copy package manifest and install only runtime production dependencies
COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copy compiled JavaScript from builder stage
COPY --from=builder /app/dist ./dist

# Create persistent storage directory for SQLite and uploaded educational files
RUN mkdir -p /app/data/uploads

# Expose port 5000 for local network / Kiwix hotspot devices
EXPOSE 5000

# Health check to ensure service readiness
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "const http = require('http'); http.get('http://127.0.0.1:5000/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

# Launch NEXUS backend server
CMD ["node", "dist/server.js"]
