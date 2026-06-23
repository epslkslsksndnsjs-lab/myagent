# Changelog

## [0.3.0-alpha] - 2026-06-23

### Added
- CoinGecko 免费行情(无需 key)
- 策略引擎(5 个技术指标 + 4 个策略)
  - SMA / EMA / RSI / MACD / Bollinger / ATR
  - MA Cross / RSI Mean Reversion / MACD Trend / Bollinger Bands
- Web UI (Vite + React 简化版)
  - 实时行情面板
  - 持仓管理
  - 漂亮深色主题
- GitHub Pages 项目主页 (docs/index.html)
- GitHub Actions Pages workflow
- GitHub Actions Release workflow
- 完整使用示例 (examples/usage.ts)
- 触发词自检全 ≤ 10
- 测试覆盖扩展

### Tests
- 5 个技术指标测试
- 4 个策略测试
- 2 个数据源测试
- 共 11+ 个测试

## [0.2.0-alpha] - 2026-06-23

### Added
- OKX 交易所 API 框架
- Binance 交易所 API 框架
- 4 通道告警(钉钉/微信/Telegram/webhook)
- vitest 测试框架
- GitHub Actions CI/CD
- Docker / docker-compose
- systemd service + install.sh
- LICENSE (MIT)
- TUTORIAL.md

## [0.1.0-alpha.1] - 2026-06-23

### Added
- 基础架构(main + agent + state + context)
- 8 个 AI quant 工具接口
- 多 LLM 路由
- System prompt
- 7×24 tick 驱动主循环
- README + ARCHITECTURE
