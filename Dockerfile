# ==============================================================================
# Multi-Stage Dockerfile for StatsAN Web (Next.js + Native R 4.x + lme4)
# Ready for Deploy to Railway, Render, Fly.io, Google Cloud Run, or VPS
# ==============================================================================

FROM node:20-bookworm-slim AS base

# Install R and required packages (lme4, car, jsonlite, Matrix)
RUN apt-get update && apt-get install -y --no-install-recommends \
    r-base \
    r-base-dev \
    r-cran-lme4 \
    r-cran-car \
    r-cran-jsonlite \
    r-cran-matrix \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install npm dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code and build Next.js application
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Expose port
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "run", "start"]
