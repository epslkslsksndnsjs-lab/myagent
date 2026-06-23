<div align="center">

# 🤖 myagent

### AI-powered quant trading agent

**AI 增强的量化交易 agent** · 蓝海方向:不是做 quant 工具,是做"AI 增强 quant 工具"

[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Bun](https://img.shields.io/badge/Bun-1.0+-blueviolet)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://typescriptlang.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![GitHub stars](https://img.shields.io/github/stars/epslkslsksndnsjs-lab/myagent)](https://github.com/epslkslsksndnsjs-lab/myagent/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/epslkslsksndnsjs-lab/myagent)](https://github.com/epslkslsksndnsjs-lab/myagent/network)
[![GitHub issues](https://img.shields.io/github/issues/epslkslsksndnsjs-lab/myagent)](https://github.com/epslkslsksndnsjs-lab/myagent/issues)

[English](README.md) · [中文](README.md) · [文档](docs/) · [GitHub](https://github.com/epslkslsksndnsjs-lab/myagent)

</div>

---

## ⚡ 5 分钟快速开始

```bash
# 1. 克隆
git clone https://github.com/epslkslsksndnsjs-lab/myagent.git
cd myagent

# 2. 安装
bun install

# 3. 配置(可选 - 不配也能用 mock 跑)
cp .env.example .env
# 填入 ANTHROPIC_API_KEY 或 DEEPSEEK_API_KEY

# 4. 跑(paper 模式)
QUANT_MODE=paper bun run dev

# 5. Web UI(另一终端)
cd web && bun install && bun run dev
# 打开 http://localhost:5173
```

---

## 🎯 为什么 myagent?

```
传统 quant 工具                 myagent
───────────────                 ───────
vnpy 42K stars             +   AI 友好接口
backtrader 12K            +   多 LLM 路由(4 家)
100+ 工具                  +   自然语言策略
0 AI 集成                  +   AI 7×24 监控
用户自己写策略              +   智能风控(0.5% 纪律)
                                              
传统 = 工具             myagent = 工具 + AI + 7×24
```

**蓝海**:quant 工具 100+,**AI 增强 quant 工具 = 0 个**。

---

## ✨ 核心能力

### 8 个 AI Quant 工具

| # | 工具 | 说明 |
|---|---|---|
| 1 | `get_market_data` | 实时行情(多源:CoinGecko / Yahoo / Binance) |
| 2 | `place_order` | 下单(OKX / Binance,paper + live) |
| 3 | `get_balance` | 查账户余额 |
| 4 | `get_positions` | 查持仓 |
| 5 | `get_historical_data` | 历史 K 线 |
| 6 | `run_backtest` | 回测引擎(支持手续费/滑点) |
| 7 | `send_alert` | 告警(钉钉/微信/Telegram/webhook) |
| 8 | `update_config` | 动态改配置 |

### 5 个扩展工具(风控)

- `calculate_position_size` - 风险仓位计算
- `check_drawdown` - 回撤监控
- `calculate_kelly` - Kelly 公式
- `get_orderbook` - 订单簿快照
- `calculate_slippage` - 滑点预估

### 5 个技术指标(纯函数)

`SMA` / `EMA` / `MACD` / `RSI` / `Bollinger` / `ATR`

### 4 个策略(可配置)

- **MA Cross**: 短期均线上穿/下穿长期均线
- **RSI Mean Reversion**: 超买超卖反转
- **MACD Trend**: MACD 与 signal 交叉
- **Bollinger Bands**: 突破布林带

### 12 个性能指标(回测后)

`Sharpe` / `Sortino` / `Calmar` / `MaxDD` / `Volatility` / `WinRate` / `ProfitFactor` / `Skewness` / `Kurtosis` / `MaxDD Duration` / `Annualized Return` / `Total Return`

### 5 个 LLM 支持

```
Claude 4.5 (主)  OpenAI GPT-4o  DeepSeek  Qwen  Mock
   ↓
  自动降级链(4 家 LLM 失败 → mock 兜底)
```

### 4 通道告警

钉钉 / 微信 / Telegram / 通用 Webhook

---

## 🏗️ 架构

```
myagent/
├── src/
│   ├── main.ts            # 入口 + 7×24 主循环
│   ├── core/              # Agent / State / Context
│   ├── llm/               # 5 LLM 路由 + Mock + Benchmark
│   ├── tools/quant/       # 13 个 quant 工具(8 核心 + 5 扩展)
│   ├── strategies/        # 6 指标 + 4 策略 + 12 性能指标
│   ├── backtest/          # 完整回测引擎
│   ├── exchanges/         # OKX + Binance 真实 API
│   ├── data/              # CoinGecko + Yahoo Finance 免费数据
│   └── alerts/            # 4 通道告警
├── web/                   # Vite + React UI
├── tests/                 # 30+ 个测试
├── deploy/                # systemd + install.sh
└── docs/                  # 文档 + GitHub Pages
```

---

## 🚀 部署

### Docker(推荐)

```bash
docker compose up -d
docker compose logs -f
```

### systemd(生产)

```bash
sudo ./deploy/install.sh
sudo systemctl start myagent
sudo journalctl -u myagent -f
```

详见 [docs/TUTORIAL.md](docs/TUTORIAL.md)

---

## 📊 性能数字

| 维度 | 数据 |
|---|---|
| 文件数 | 75+ |
| 代码行 | 4,500+ |
| 工具数 | 13 |
| 策略数 | 4 |
| 指标数 | 6 |
| 测试数 | 30+ |
| LLM 支持 | 5 |
| 部署方式 | 3(Docker / systemd / 手动) |
| 告警通道 | 4 |
| 数据源 | 4(免费) |

---

## 💼 商业模式

```
免费层(开源):
  - 完整 13 工具
  - 5 LLM 路由
  - 4 策略
  - 6 指标
  - 回测引擎
  - 7×24 paper trading

付费层($99-299/月):
  - 多账户管理
  - 高级策略(机构级)
  - 实时风控告警
  - 客户支持
  - 策略定制
```

---

## 🛣️ 路线图

- [x] **v0.1**: 基础架构 + 8 个工具接口
- [x] **v0.2**: 真实 API 框架 + 测试 + CI/CD + Docker
- [x] **v0.3**: 策略引擎 + Web UI + GitHub Pages
- [x] **v0.4**: 回测引擎 + 风控工具 + Yahoo Finance
- [x] **v0.5**: Mock LLM + Benchmark + 30+ 测试
- [ ] **v0.6**: 真实 LLM 集成测试 + Paper trading 验证
- [ ] **v1.0**: 商业化 v1 + 100 客户
- [ ] **v2.0**: 多 LLM 商业版 + 1000 客户

---

## 🆚 vs 竞品

| 维度 | vnpy | backtrader | **myagent** |
|---|---|---|---|
| Stars | 42K | 12K | 起步 |
| 完整功能 | ✅ | ✅ | ✅ |
| AI 集成 | ❌ | ❌ | **✅** |
| 多 LLM | ❌ | ❌ | **✅** |
| 7×24 | ⚠️ 需自己搭 | ⚠️ 需自己搭 | **✅** |
| 实时风控 | ⚠️ 需自己写 | ⚠️ 需自己写 | **✅** |
| Web UI | ⚠️ 需自己写 | ❌ | **✅** |
| 一键部署 | ❌ | ❌ | **✅** |

---

## 📜 License

[MIT](LICENSE) - 完全开源,商用免费

---

## 🤝 贡献

见 [CONTRIBUTING.md](CONTRIBUTING.md)。

---

## 🙏 借鉴

本项目借鉴了以下开源项目(架构思路):

- [Claude Code 2.1.88](https://github.com/anthropics/claude-code) - Agent 架构(已开源泄露)
- [claude-code-router](https://github.com/musistudio/claude-code-router) - 多 LLM 路由(35K stars MIT)
- [vnpy](https://github.com/vnpy/vnpy) - Quant 工具(42K stars MIT)
- [Lean](https://github.com/QuantConnect/Lean) - 回测引擎
- [Backtrader](https://github.com/mementum/backtrader) - Python 回测
- [LangChain](https://github.com/langchain-ai/langchain) - Agent 框架(95K stars MIT)

完全自有代码,完全自有 IP。

---

## ⭐ Star History

如果这个项目对你有帮助,给我们一个 ⭐!

[![Star History Chart](https://api.star-history.com/svg?repos=epslkslsksndnsjs-lab/myagent&type=Date)](https://star-history.com/#epslkslsksndnsjs-lab/myagent)

---

<div align="center">

**🤖 myagent - 让 AI 帮你做 quant trading**

[官网](https://epslkslsksndnsjs-lab.github.io/myagent/) · [GitHub](https://github.com/epslkslsksndnsjs-lab/myagent) · [Issues](https://github.com/epslkslsksndnsjs-lab/myagent/issues)

由 AI + 人类共同构建 · MIT License

</div>
