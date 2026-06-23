# myagent

> AI-powered quant trading agent · AI 增强的量化交易 agent
>
> 蓝海方向:不是做 quant 工具(vnpy 已有 42K stars),
> 是做"AI 增强 quant 工具"(0 竞品)。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Bun](https://img.shields.io/badge/Bun-1.0+-blue)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://typescriptlang.org)

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

- **散户 quant trader**: 有 $10K-$100K 资金,想要 AI 帮忙做交易
- **不会编程的 trader**: 用自然语言跟 AI 沟通,AI 帮他写 + 跑 + 监控

## 快速开始

```bash
# 1. 克隆
git clone https://github.com/yourname/myagent.git
cd myagent

# 2. 安装
bun install

# 3. 配置
cp .env.example .env
nano .env  # 填入 LLM API key

# 4. 跑(paper 模式)
QUANT_MODE=paper bun run dev

# 5. Web UI(另一终端)
cd web && bun install && bun run dev
# 打开 http://localhost:5173
```

详见 [docs/TUTORIAL.md](docs/TUTORIAL.md)。

## 架构

```
myagent/
├── src/
│   ├── main.ts            # 入口 + 7×24 主循环
│   ├── core/              # Agent / State / Context
│   ├── llm/               # 多 LLM 路由(4 家)
│   ├── tools/quant/       # 8 个 AI quant 工具
│   ├── strategies/        # 5 个技术指标 + 4 个策略
│   ├── exchanges/         # OKX / Binance 真实 API
│   ├── data/              # CoinGecko 免费行情
│   └── alerts/            # 4 通道告警
├── web/                   # Vite + React UI
├── tests/                 # vitest 测试
├── deploy/                # systemd + install
└── docs/                  # 文档
```

详见 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)。

## 8 个 AI quant 工具

1. `get_market_data` - 实时行情
2. `place_order` - 下单
3. `get_balance` - 查账户余额
4. `get_positions` - 查持仓
5. `get_historical_data` - 拉历史 K 线
6. `run_backtest` - 回测
7. `send_alert` - 告警
8. `update_config` - 改配置

## 4 个策略

- **MA Cross**: 短期均线上穿/下穿长期均线
- **RSI Mean Reversion**: 超买超卖反转
- **MACD Trend**: MACD 与 signal 交叉
- **Bollinger Bands**: 突破布林带

## 5 个技术指标(纯函数)

- `sma(prices, period)` - 简单移动平均
- `ema(prices, period)` - 指数移动平均
- `rsi(prices, period)` - 相对强弱指数
- `macd(prices, fast, slow, signal)` - MACD
- `bollinger(prices, period, stdDev)` - 布林带
- `atr(candles, period)` - 平均真实波幅

## 4 LLM 路由

```
Claude (主)  →  OpenAI  →  DeepSeek  →  Qwen
   ↓
降级链(自动 fallback)
```

## 4 通道告警

- 钉钉 (DingTalk)
- 微信 (WeChat Work)
- Telegram
- 通用 Webhook

## 部署

### Docker

```bash
docker compose up -d
```

### systemd

```bash
sudo ./deploy/install.sh
sudo systemctl start myagent
```

详见 [docs/TUTORIAL.md](docs/TUTORIAL.md)。

## 商业模式

```
免费层:
  - 1 个 LLM
  - 基础工具
  - Paper mode

付费层($99-299/月):
  - 多 LLM
  - 高级工具
  - 7×24 监控
  - 策略模板
  - 客户支持
```

## 路线图

- ✅ v0.1: 骨架 + 8 个工具接口
- ✅ v0.2: 真实 API 框架 + 测试 + CI/CD + Docker
- ✅ v0.3: 策略引擎 + Web UI + GitHub Pages
- ⏳ v0.5: 接入真实策略数据 + Paper trading 验证
- ⏳ v1.0: 商业化 v1 + 100 客户
- ⏳ v2.0: 1000 客户 + 多 LLM 商业版

## 借鉴 vs 自有

**借鉴**(架构思路,合法):
- Claude Code 2.1.88(已泄露)agent loop 模式
- claude-code-router 35K stars MIT(多 LLM)
- vnpy 42K stars MIT(quant 工具)

**自有**(差异化):
- 8 个 AI quant 工具(input/output 标准化)
- Tick-driven 而非 REPL
- 7×24 自动
- 国产 LLM 默认支持
- AI + quant 蓝海(0 竞品)

## 贡献

见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## License

[MIT](LICENSE)
