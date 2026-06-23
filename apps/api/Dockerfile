# NestJS API — built from the monorepo root context:
#   docker build -f apps/api/Dockerfile -t helmagents-api .
FROM node:22-slim AS build
WORKDIR /repo
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile
# Turbo builds the API and all workspace packages it depends on, in order.
RUN pnpm exec turbo run build --filter=api

FROM node:22-slim AS run
WORKDIR /repo/apps/api
RUN corepack enable
ENV NODE_ENV=production
ENV API_PORT=5171
# Copy the fully-built monorepo (node_modules + each package's dist). The API's
# dist imports @helm-agents/* resolved via the workspace node_modules links.
COPY --from=build /repo /repo
EXPOSE 5171
CMD ["node", "dist/main.js"]
