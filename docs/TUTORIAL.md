# myagent 使用教程

## 5 分钟快速开始

### 1. 克隆 & 安装

```bash
git clone https://github.com/yourname/myagent.git
cd myagent
bun install
```

### 2. 配置 LLM API key(必须,二选一)

```bash
cp .env.example .env
nano .env
```

填入至少一个 LLM provider:
```bash
# Anthropic Claude (推荐)
ANTHROPIC_API_KEY=sk-ant-xxx

# 或 DeepSeek (国产,便宜)
DEEPSEEK_API_KEY=sk-xxx

# 或 Qwen
QWEN_API_KEY=sk-xxx
```

### 3. 配置交易所 API(可选,paper 模式不需要)

```bash
# OKX
OKX_API_KEY=xxx
OKX_SECRET=xxx
OKX_PASSPHRASE=xxx

# Binance
BINANCE_API_KEY=xxx
BINANCE_SECRET=xxx
```

### 4. 启动(paper 模式)

```bash
QUANT_MODE=paper bun run dev
```

你应该看到:
```
========================================
  myagent v0.1.0-alpha.1
  AI-powered quant trading agent
  Mode: paper
  Tick interval: 300s
========================================
State loaded
LLM Router initialized, available: anthropic
Tools registered: get_market_data, place_order, ...
Entering main loop...
--- Tick 1 ---
```

### 5. 真实交易(小心!)

```bash
# 1. 先用 testnet 测
QUANT_MODE=live OKX_TESTNET=true bun run dev

# 2. 确认无误,改用真实
QUANT_MODE=live bun run dev
```

## Docker 部署

```bash
docker compose up -d
docker compose logs -f
```

## systemd 部署(生产)

```bash
sudo ./deploy/install.sh
sudo systemctl start myagent
sudo journalctl -u myagent -f
```

## 关键概念

### Tick 间隔

```bash
TICK_INTERVAL=300  # 5 分钟
TICK_INTERVAL=60   # 1 分钟(高频)
TICK_INTERVAL=900  # 15 分钟(低频)
```

### 风控参数(0.5% 纪律)

在 `src/llm/prompts.ts` 中改:
- 单笔风险 0.5%
- 总持仓 ≤ 60%
- 单一标的 ≤ 20%
- 杠杆 ≤ 1.5x

### 告警配置

```bash
# .env
DINGTALK_WEBHOOK=https://oapi.dingtalk.com/robot/send?access_token=xxx
WECHAT_WEBHOOK=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx
TELEGRAM_WEBHOOK=https://api.telegram.org/botxxx/sendMessage
```

## 常见问题

**Q: 启动报错 "No LLM provider configured"**
A: 在 .env 填入至少一个 LLM API key

**Q: tick 一直 hold 不动?**
A: 规则引擎没匹配,LLM 决策保守。可以加日志看 LLM 响应

**Q: 怎么加新工具?**
A: 在 `src/tools/quant/index.ts` 加,实现 Tool 接口
