# Frontend Dockerfile (Next.js 14)
# 1) Install dependencies
FROM node:18-bullseye AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# 2) Build the Next app
FROM node:18-bullseye AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Ensure public directory exists even if absent in repo
RUN mkdir -p public
RUN npm run build

# 3) Production runtime
FROM node:18-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy only necessary runtime files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "run", "start"]
