# myagent

> AI-powered quant trading agent · AI 增强的量化交易 agent
> 
> 蓝海方向:不是做 quant 工具(vnpy 已有 42K stars),
> 是做"AI 增强 quant 工具"(0 竞品)。

## 核心定位

```
传统 quant 工具(vnpy/backtrader/...):
  - 100+ 个免费工具
  - 0 AI 集成
  - 用户自己写策略、自己监控

myagent 的差异:
  + Claude / DeepSeek / Qwen 多 LLM 接入
  + 自然语言写策略("BTC 突破 MA20 就买 0.1")
  + AI 7×24 监控 + 自动调参
  + AI 风险预警
  + 包装 vnpy,跟它共生
```

## 用户场景

```
场景 1: 散户 quant trader(目标用户)
  - 有 $10K-$100K 资金
  - 用过 vnpy 或 backtrader
  - 不会写策略代码
  - 想要 AI 帮忙
  - 愿意付费 99-299 元/月

场景 2: 不会编程的 trader
  - 有 quant 想法
  - 不会 Python
  - 用自然语言跟 AI 沟通
  - AI 帮他写 + 跑 + 监控
```

## 架构(v0.1 alpha 骨架)

```
myagent/
├── src/
│   ├── main.ts                  # 入口 + 主循环
│   ├── core/
│   │   ├── agent.ts             # Agent 核心(借鉴 Claude Code 架构)
│   │   ├── context.ts           # 上下文管理
│   │   └── state.ts             # 状态管理
│   ├── llm/
│   │   ├── router.ts            # 多 LLM 路由(Claude/OpenAI/DeepSeek/Qwen)
│   │   └── prompts.ts           # System prompt
│   ├── tools/
│   │   ├── quant/               # 8 个 AI quant 工具
│   │   │   ├── get_market_data.ts
│   │   │   ├── place_order.ts
│   │   │   ├── get_balance.ts
│   │   │   ├── get_positions.ts
│   │   │   ├── get_historical_data.ts
│   │   │   ├── run_backtest.ts
│   │   │   ├── send_alert.ts
│   │   │   └── update_config.ts
│   │   └── registry.ts          # 工具注册器
│   └── utils/
├── examples/                    # 使用示例
├── docs/                        # 文档
├── package.json
├── tsconfig.json
└── README.md
```

## 8 个 AI quant 工具(v0.1 实现)

1. `get_market_data` - 实时行情(TradingView MCP 风格)
2. `place_order` - 下单(OKX/Binance 风格)
3. `get_balance` - 查账户余额
4. `get_positions` - 查持仓
5. `get_historical_data` - 拉历史 K 线
6. `run_backtest` - 回测策略
7. `send_alert` - 告警(钉钉/微信)
8. `update_config` - 改配置

## 商业模式

```
免费: 基础工具 + 1 个 LLM
付费: 高级工具 + 多 LLM + 7×24 监控 + 客户支持
价格: 99-299 元/月
目标: 5 年 1000-10000 付费用户 = $100K-$1M MRR
```

## 路线图

```
v0.1 (现在):  骨架 + 1-2 个工具能跑       (1-2 周)
v0.5:         8 个工具全部实现           (1 月)
v1.0:         集成 vnpy + 真实交易所     (2-3 月)
v1.5:         Web UI + 多人协作          (3-6 月)
v2.0:         商业化 v1 + 100 客户       (6-12 月)
```

## 安装

```bash
# 1. 克隆
git clone https://github.com/yourname/myagent.git
cd myagent

# 2. 安装依赖
bun install

# 3. 配置
cp .env.example .env
# 编辑 .env,填入你的 LLM API key

# 4. 跑
bun run dev
```

## 借鉴 vs 自有

```
借鉴(架构思路,合法):
  + Claude Code 2.1.88 的 agent 架构(52 万行源码已泄露)
  + OpenAI Agents SDK 设计
  + LangGraph 状态机

自有(差异化):
  + 8 个 quant 工具
  + 多 LLM 路由
  + 自然语言策略
  + 中国本土化
```

## 竞品分析

```
quant 工具:
  - vnpy 42K stars(MIT,Python)         - 我们包装它
  - backtrader 12K stars               - 我们包装它
  - quantconnect                       - 闭源,云端

AI agent:
  - Cursor $2.5B 估值                  - 编码 IDE
  - Bolt $2.5B 估值                    - Web 开发
  - Devin $1B 估值                     - 自主编码

AI + quant:
  - 0 个真正"AI 增强 quant 工具"        ← 蓝海
```

## 核心洞察

```
不是做 quant 工具:
  = 100+ 竞品(vnpy 等)
  = 0 moat
  = 死路

是 AI 增强 quant 工具:
  = 0 竞品(蓝海)
  = AI moat(5-10 年不被复制)
  = 100 万+ 潜在用户
  = 活路
```

## License

MIT

## 贡献

这是 alpha 阶段,欢迎 PR。
