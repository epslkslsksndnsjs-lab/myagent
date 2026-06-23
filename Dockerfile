# myagent - AI quant trading agent
# 多阶段构建,最小镜像

# Stage 1: 依赖
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Stage 2: 构建
FROM oven/bun:1 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun build src/main.ts --outdir=dist --target=bun --minify

# Stage 3: 运行
FROM oven/bun:1-slim AS production
WORKDIR /app

# 创建非 root 用户
RUN groupadd -r myagent && useradd -r -g myagent myagent

# 复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/src/llm/prompts.ts ./dist/ 2>/dev/null || true

# 数据/日志目录
RUN mkdir -p /app/data /app/logs && chown -R myagent:myagent /app
USER myagent

# 环境
ENV NODE_ENV=production
ENV TZ=UTC
ENV PORT=9090

# 端口
EXPOSE 9090

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD bun run -e "fetch('http://localhost:9090/health/live').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))" || exit 1

# 启动
CMD ["bun", "run", "dist/main.js", "start"]
