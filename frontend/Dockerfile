# syntax=docker/dockerfile:1

# --- Stage 1: Base Image ---
# Pinned: Node.js 22.12.0 on Alpine 3.21
FROM node:22.12.0-alpine3.21 AS base
RUN apk add --no-cache libc6-compat

# --- Stage 2: Dependencies ---
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production --frozen-lockfile

# --- Stage 3: Builder ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_OUTPUT_MODE=export

RUN npm run build

# --- Stage 4: Production Runner ---
# CRITICAL: PINNED NGINX VERSION
# Pinned: NGINX 1.26.2 on Alpine 3.21
FROM nginx:1.26.2-alpine3.21 AS runner

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /usr/share/nginx/html

# Copy static build output from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/out ./

# Copy custom nginx configuration (optional)
COPY --chown=nextjs:nodejs nginx.conf /etc/nginx/nginx.conf

USER nextjs

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
