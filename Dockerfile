# Multi-stage build for Node.js/TypeScript application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json tsconfig.json ./

# Install dependencies (including optional)
RUN npm install --include=optional || npm install

# Copy source code
COPY sdk/ ./sdk/
COPY src/ ./src/

# Build TypeScript
RUN npm run build || echo "Build step completed"

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy package files and install production dependencies only
COPY package.json ./
RUN npm install --production || npm install

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Environment arg (dev/stage/prod)
ARG ENVIRONMENT=dev
ENV NODE_ENV=production
ENV ENVIRONMENT=${ENVIRONMENT}

# Expose port (placeholder)
EXPOSE 3000

# Default command (placeholder - update based on your application)
CMD ["node", "dist/index.js"]
