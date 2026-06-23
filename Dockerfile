# myagent - AI quant trading agent
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production=false

# Copy source
COPY . .

# Build
RUN bun run build

# Production
FROM oven/bun:1-slim AS production
WORKDIR /app
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./

# Health check
HEALTHCHECK --interval=60s --timeout=10s --start-period=30s --retries=3 \
  CMD bun run dist/main.js --health || exit 1

# Run
CMD ["bun", "run", "dist/main.js"]
