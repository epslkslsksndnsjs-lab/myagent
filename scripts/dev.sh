#!/bin/bash
# 开发模式启动
set -e

cd "$(dirname "${BASH_SOURCE[0]}")/.."

# 用 mock LLM(无需 key)
export QUANT_MODE=${QUANT_MODE:-paper}
export TICK_INTERVAL=${TICK_INTERVAL:-30}  # 30s for dev

echo "🔧 myagent 开发模式"
echo "  模式: $QUANT_MODE"
echo "  Tick: ${TICK_INTERVAL}s"
echo "  按 Ctrl+C 退出"
echo ""

bun run src/main.ts start
