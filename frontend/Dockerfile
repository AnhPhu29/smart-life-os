# Frontend Dockerfile - Next.js Multi-stage build

# Stage 1: Dependencies
FROM node:20-alpine as deps

WORKDIR /app

COPY package*.json ./

RUN npm ci

# Stage 2: Builder
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.js ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY src ./src
COPY public ./public

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Build the application
RUN npm run build

# Stage 3: Runtime
FROM node:20-alpine

WORKDIR /app

# Install dumb-init
RUN apk add --no-cache dumb-init

# Copy package.json
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY next.config.js ./

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Set environment
ENV NODE_ENV=production

# Use dumb-init to run the app
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]
