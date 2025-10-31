# Backend Dockerfile (Node + Puppeteer + Prisma)
# Build stage
FROM ghcr.io/puppeteer/puppeteer:22.13.1 AS builder
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm install

# Copy Prisma schema so client can be generated during build if needed
COPY prisma ./prisma

# Copy source and build
COPY tsconfig.json ./
COPY src ./src
COPY seed.ts ./seed.ts
RUN npm run build


# Production stage (still using puppeteer base to keep chromium and deps)
FROM ghcr.io/puppeteer/puppeteer:22.13.1 AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy package files and prisma schema first so install runs postinstall for @prisma/client
COPY package*.json ./
COPY prisma ./prisma

# Install only production dependencies
RUN npm install --omit=dev

# Copy built artifacts
COPY --from=builder /app/dist ./dist

# Optional: set default port
ENV PORT=5000
EXPOSE 5000

# Start server
CMD ["node", "dist/index.js"]
