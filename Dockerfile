# Build static assets
FROM docker.io/node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.ts tsconfig.json ./
COPY scripts ./scripts
COPY public ./public
COPY src ./src
RUN npm run build

# Serve with non-root nginx (OpenShift-friendly)
FROM docker.io/nginxinc/nginx-unprivileged:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
