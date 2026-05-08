FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build:worker

FROM base AS frontend-deps
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci

FROM base AS frontend-builder
WORKDIR /app
COPY --from=frontend-deps /app/node_modules ./node_modules
COPY frontend/ ./
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/wrangler.toml ./
COPY --from=builder /app/package.json ./

EXPOSE 8787

CMD ["npx", "wrangler", "dev"]