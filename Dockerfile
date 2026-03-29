# Frontend Dockerfile for mvp-delivery (Next.js)

# =========================
# 1) Builder
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# NEXT_PUBLIC_* vars are baked at build time — pass the real backend URL here.
# Example: docker build --build-arg NEXT_PUBLIC_API_URL=http://<minikube-ip>:30400 ...
ARG NEXT_PUBLIC_API_URL=http://mazar.com/api 
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

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
