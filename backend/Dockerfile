# Backend Dockerfile (multi-stage)
FROM node:20-alpine AS base
WORKDIR /app

# Build stage: install dependencies and compile TypeScript
FROM base AS build
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json* .npmrc* ./
# Install including dev deps so tsc is available
RUN npm ci --legacy-peer-deps --no-audit --no-fund --include=dev || npm install --legacy-peer-deps --no-audit --no-fund --include=dev
COPY tsconfig.json ./
COPY jest.config.cjs ./
COPY src ./src
RUN npm run build

# Runtime stage: production image with only production dependencies
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -S app && adduser -S app -G app

# Install production dependencies only
COPY package.json package-lock.json* .npmrc* ./
RUN npm ci --legacy-peer-deps --only=production --no-audit --no-fund || npm install --legacy-peer-deps --only=production --no-audit --no-fund

# Copy compiled output
COPY --from=build /app/dist ./dist

# Ensure uploads dir exists and is writable by the app user
RUN mkdir -p /app/uploads && chown -R app:app /app/uploads

# Expose port and HEALTHCHECK (readiness endpoint)
ENV PORT=3000
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://localhost:3000/api/ready || exit 1

USER app
CMD ["node","dist/index.js"]
