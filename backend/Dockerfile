# Backend Dockerfile - Multi-stage build for optimization

# Stage 1: Build
FROM node:20-slim as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build
RUN npm run prisma:generate

# Stage 2: Runtime
FROM node:20-slim

WORKDIR /app

# Install dumb-init and openssl for Prisma
RUN apt-get update && apt-get install -y dumb-init openssl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy compiled code from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy prisma schema for runtime
COPY prisma ./prisma

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/v1/actuator/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to run the app
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/server.js"]
