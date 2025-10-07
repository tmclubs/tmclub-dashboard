# Multi-stage build with Bun for React + Vite + TypeScript
# ================================================

# Stage 1: Install dependencies
FROM oven/bun:1.1-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* bun.lockb* ./

# Install dependencies with Bun
RUN bun install --frozen-lockfile

# Stage 2: Build the application
FROM oven/bun:1.1-alpine AS builder
WORKDIR /app

# Copy dependency files
COPY package.json bun.lockb* package-lock.json* ./
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Stage 3: Production image
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

# Switch to non-root user
USER node

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5173/ || exit 1

# Run the application with Bun
CMD ["bun", "run", "preview"]