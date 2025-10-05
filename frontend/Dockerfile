# Frontend Dockerfile (multi-stage Vite -> Nginx)
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* .npmrc* ./
# Use npm install here so the image can be built even when a package-lock.json
# isn't present in the workspace. This installs both dev and prod deps so the
# subsequent `npm run build` (tsc + vite) can run inside the container.
RUN npm install --legacy-peer-deps --no-audit --no-fund
COPY . .
RUN npm run build

# Runtime
FROM nginx:1.27-alpine AS runtime
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist ./
# Basic security headers via nginx conf
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://localhost:8080/ || exit 1
