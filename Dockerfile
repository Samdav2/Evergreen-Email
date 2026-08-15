# ============================================================
# Stage 1: Build frontend
# ============================================================
FROM node:22-slim AS frontend-build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ============================================================
# Stage 2: Production runtime (Python + Node)
# ============================================================
FROM python:3.12-slim

# Install Node.js 22 into the Python image
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl ca-certificates libmagic1 && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Install Node production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy application source
COPY backend/ ./backend/
COPY server.ts ./
COPY index.html ./
COPY src/ ./src/
COPY start.sh ./

# Copy built frontend + compiled Express server from Stage 1
COPY --from=frontend-build /app/dist ./dist

RUN chmod +x start.sh

EXPOSE 3000

CMD ["./start.sh"]
