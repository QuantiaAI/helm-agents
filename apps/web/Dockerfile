# React/Vite SPA — built from the monorepo root context, served by nginx:
#   docker build -f apps/web/Dockerfile -t helmagents-web .
FROM node:22-slim AS build
WORKDIR /repo
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile
# VITE_API_BASE_URL is intentionally empty: the SPA calls same-origin /api,
# which nginx reverse-proxies to the api service (see nginx.conf).
RUN pnpm exec turbo run build --filter=web

FROM nginx:alpine AS run
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html
EXPOSE 80
