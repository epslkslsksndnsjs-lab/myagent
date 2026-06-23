# myagent 架构

## 借鉴 vs 自有

### 借鉴(架构思路,合法)
- Claude Code 2.1.88 agent loop 模式(已泄露源码)
- claude-code-router 多 LLM 路由(35K stars MIT)
- vnpy 整体 quant 工具设计(42K stars MIT)
- LangGraph 状态机思路

### 自有(差异化)
- 8 个 AI quant 工具(input/output 标准化)
- Tick-driven 而非 REPL
- 多 LLM 路由(国产 DeepSeek/Qwen)
- 7×24 自动化(系统服务)
- 风险纪律(0.5%/单)

## 5 层架构

```
Layer 1: 入口(daemon + tick 调度)
  - 借鉴 systemd 思路
  - 自有 setInterval 实现

Layer 2: Agent 核心
  - 借鉴 Claude Code QueryEngine 思路
  - 异步循环 + 状态机
  - 自有:tick 触发而非 REPL

Layer 3: LLM 路由
  - 借鉴 claude-code-router 35K stars 模式
  - 4 家 LLM 支持(Claude/OpenAI/DeepSeek/Qwen)
  - 自有:国产 LLM 默认支持

Layer 4: 工具层(8 个 AI quant 工具)
  - 完全自有
  - 借鉴 vnpy 工具设计(数据源、回测、订单)
  - 差异化:AI 友好的 input/output

Layer 5: 基础设施
  - 借鉴 Claude Code memdir/state 思路
  - 自有:JSON 文件存储(v0.1 简化版)
```

## 数据流(每 tick)

```
1. main.ts setInterval
  ↓
2. Agent.tick()
  ↓
3. get_market_data(TradingView MCP 风格)
  ↓
4. get_historical_data(Binance API)
  ↓
5. 规则引擎(本地,无 LLM)
  ↓ (if 复杂)
6. LLM.chat()(claude/deepseek/qwen)
  ↓
7. 风控检查(本地)
  ↓
8. place_order(OKX/Binance API)
  ↓
9. send_alert(钉钉/微信)
  ↓
10. state 持久化
```

## 5-10 年路线图

```
v0.1 (现在): 骨架 + mock 数据
  - 8 个工具的接口定义
  - Agent loop
  - LLM 路由
  - 状态管理
  - 1-2 周

v0.5 (1 月): 接入真实 API
  - TradingView 行情
  - OKX 下单
  - Binance 历史
  - 1 月

v1.0 (2-3 月): 真实交易
  - Paper trading 验证
  - 风控规则
  - 告警
  - 2-3 月

v1.5 (3-6 月): Web UI
  - 实时面板
  - 历史回测
  - 策略管理
  - 3-6 月

v2.0 (6-12 月): 商业化
  - 100 个付费用户
  - $10K MRR
  - 6-12 月
```

## 商业模式

```
免费层:
  - 1 个 LLM
  - 基础工具
  - 1 个 tick 频率

付费层($99-299/月):
  - 多 LLM
  - 高级工具
  - 7×24 监控
  - 客户支持
  - 策略模板
```

## 竞品

```
quant 工具:
  - vnpy 42K ★     - 我们包装它(不竞争)
  - backtrader 12K ★  - 我们包装它
  - quantconnect   - 闭源云端

AI agent:
  - Cursor $2.5B   - 编码 IDE(不竞争)
  - Bolt $2.5B     - Web 开发(不竞争)

AI + quant(0 竞品):
  - 我们 = 第一个
```

## 核心 moat

```
不是工具(可复制)
不是 LLM API(巨头有)
是:
  + 5-10 年数据(时间 moat)
  + 5-10 年客户(关系 moat)
  + 5-10 年经验(能力 moat)
  + "AI + quant" 先发(蓝海 moat)
```
