# Multi-stage build with Bun for React + Vite + TypeScript
# ================================================

# Stage 1: Install dependencies
FROM oven/bun:1.1-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json ./

# Always fresh install without lockfile
RUN bun install

# Stage 2: Build the application
FROM oven/bun:1.1-alpine AS builder
WORKDIR /app

# Copy dependency files
COPY package.json ./
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build-time environment for Vite
ARG VITE_API_URL
ARG VITE_APP_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_GOOGLE_CLIENT_SECRET
ARG VITE_GOOGLE_REDIRECT_URI
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_URL=$VITE_APP_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_SECRET=$VITE_GOOGLE_CLIENT_SECRET
ENV VITE_GOOGLE_REDIRECT_URI=$VITE_GOOGLE_REDIRECT_URI

# Build the application
RUN bun run build

# Stage 3: Production image (preview mode - legacy, not used in production now)
FROM oven/bun:1.1-alpine AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5173

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 node

# Copy built files from builder
COPY --from=builder --chown=node:nodejs /app/dist ./dist
COPY --from=builder --chown=node:nodejs /app/public ./public
COPY --from=builder --chown=node:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=node:nodejs /app/package.json ./package.json

# Switch to non-root user
USER node

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5173/ || exit 1

# Run the application with Bun
CMD ["bun", "run", "preview"]

# Stage 4: Nginx static server for production
FROM nginx:alpine AS web

# Remove default content
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose default HTTP port
EXPOSE 80