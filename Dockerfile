FROM node:20.19.0 AS builder

WORKDIR /app

# In CI/Docker builds we want to skip husky's install step which runs in the
# 'prepare' lifecycle. Setting CI=true causes the prepare script to skip husky.
ENV CI=true

# Copy everything - using a full copy keeps builds simple in CI
COPY . .

# Install root workspace deps (include dev to ensure build tools available)
RUN npm ci --include=dev --legacy-peer-deps || npm install --include=dev --legacy-peer-deps

# Build frontend in its own context to guarantee local node_modules
WORKDIR /app/frontend
RUN npm ci --include=dev --legacy-peer-deps || npm install --include=dev --legacy-peer-deps
RUN npm run build

# Build backend
WORKDIR /app/backend
RUN npm ci --include=dev --legacy-peer-deps || npm install --include=dev --legacy-peer-deps
RUN npm run build

# Copy frontend build artifacts into backend/public
RUN mkdir -p /app/backend/public && cp -r /app/frontend/dist/* /app/backend/public/ || true

### Final runtime image
FROM node:20.19.0 AS runner

WORKDIR /app/backend

# Ensure CI=true in the runtime image during install steps as well so any
# lifecycle scripts that check CI are skipped.
ENV CI=true

# Copy backend package manifest and install production deps
COPY backend/package.json ./package.json
COPY backend/package-lock.json ./package-lock.json
RUN npm ci --omit=dev --legacy-peer-deps || npm install --omit=dev --legacy-peer-deps

# Copy built backend and static assets
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/public ./public

EXPOSE 3000
CMD ["node", "dist/index.js"]
