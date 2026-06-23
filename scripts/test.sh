#!/bin/bash
# 跑所有测试
set -e

cd "$(dirname "${BASH_SOURCE[0]}")/.."

echo "🧪 myagent tests"
echo ""

# 类型检查
echo "→ Type check"
bun run typecheck

# 跑测试
echo ""
echo "→ Run tests"
bun test

# 覆盖率(可选)
if [ "${COVERAGE:-0}" = "1" ]; then
  echo ""
  echo "→ Coverage"
  bun test --coverage
fi

echo ""
echo "✅ All tests passed"
