# myagent 使用示例

## 列表

| # | doc | case | 难度 |
|---|---|---|---|
| 1 | `01-backtest-ma-cross.ts` | 用 Binance 真实数据回测 MA Cross 策略 | ⭐⭐ |
| 2 | `02-paper-trading.ts` | 完整 paper trading 流程(无需 API key) | ⭐ |
| 3 | `03-benchmark-llms.ts` | 对比不同 LLM 的 quant 决策质量 | ⭐⭐ |
| 4 | `04-multi-strategy.ts` | 多策略组合投票 | ⭐⭐ |

## 运行

```bash
# 示例 1:回测
bun run examples/01-backtest-ma-cross.ts

# 示例 2:paper trading(无需 key)
bun run examples/02-paper-trading.ts

# 示例 3:LLM 对比(填 key 后)
export ANTHROPIC_API_KEY=sk-ant-xxx
export DEEPSEEK_API_KEY=sk-xxx
bun run examples/03-benchmark-llms.ts

# 示例 4:多策略
bun run examples/04-multi-strategy.ts
```

## 要求

- 示例 1:无需 key(用 Binance 公开 API)
- 示例 2:无需 key(用 mock LLM)
- 示例 3:建议填 1-2 个 LLM key
- 示例 4:无需 key
