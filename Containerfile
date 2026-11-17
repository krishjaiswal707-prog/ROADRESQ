# ==============================================================================
# ROAD RESQ AI – Multi-Stage Container Blueprint (DO188 Capstone)
# Application: ROAD RESQ AI - Smart Emergency & Traffic Management
# Base: Node 20 on Red Hat Universal Base Image / Alpine Minimal Runtime
# Ports: 5000 (Backend API & WebSockets), 5173 (Frontend Dashboard)
# ==============================================================================

# ------------------------------------------------------------------------------
# STAGE 1: Frontend Build Stage
# ------------------------------------------------------------------------------
FROM docker.io/library/node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# STAGE 2: Backend Dependencies & Native Compilation
# ------------------------------------------------------------------------------
FROM docker.io/library/node:20-alpine AS backend-builder
WORKDIR /app/backend

RUN apk add --no-cache python3 make g++

COPY backend/package*.json ./
RUN npm ci

# ------------------------------------------------------------------------------
# STAGE 3: Production Runtime
# ------------------------------------------------------------------------------
FROM docker.io/library/node:20-alpine AS runner

LABEL org.opencontainers.image.title="ROAD RESQ AI - Integrated Emergency & Traffic System" \
      org.opencontainers.image.description="Red Hat DO188 Capstone - Smart Green Corridor & Assistance Platform" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.vendor="ROAD RESQ AI Team" \
      org.opencontainers.image.licenses="MIT"

ENV NODE_ENV=production \
    PORT=5000 \
    FRONTEND_PORT=5173 \
    DEFAULT_CITY_ID=chennai \
    OSRM_BASE_URL=https://router.project-osrm.org

WORKDIR /app

# Security & Operations: Install curl for health probes
RUN apk add --no-cache curl

# Copy backend dependencies and code
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production && npm cache clean --force

COPY backend/ ./backend/

# Copy compiled frontend assets from Stage 1 into production runtime
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Install lightweight static server for frontend dashboard inside container
RUN npm install -g serve

# Security: Run as non-root user 'node'
RUN chown -R node:node /app
USER node

# Expose ports for both Backend (5000) and Frontend (5173)
EXPOSE 5000 5173

# Healthcheck probe against backend health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start script to run both backend and frontend dashboard concurrently
CMD ["sh", "-c", "cd /app/backend && node src/server.js & serve -s /app/frontend/dist -l 5173"]
