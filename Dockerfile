# Frontend Dockerfile for mvp-delivery (Next.js)

# =========================
# 1) Builder
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# NEXT_PUBLIC_* env vars are baked at build time
# Set them via docker build args or env when building in CI.
RUN npm run build

# =========================
# 2) Runtime
# =========================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./

RUN npm ci --omit=dev

EXPOSE 3000

CMD ["npm", "start"]
