# Changelog

## [0.7.0-alpha] - 2026-06-23

### Added
- **Prometheus metrics server** (`src/server/metrics_server.ts`) - HTTP /metrics /health 端点
- **Daemon 模式** (`src/cli/daemon.ts`) - 集成 metrics + health + agent
- **TradingView 集成** (`src/data/tradingview.ts`) - UDDF 数据模型 + TV Lightweight Charts 兼容
- **Discord 告警** (`src/alerts/discord.ts`) - embed 格式
- **Slack 告警** (`src/alerts/slack.ts`) - Block Kit 格式
- **3 个新示例** (5/6/7) - 多数据源/metrics exporter/Discord 告警

### Tests
- 3 个新测试 (metrics_server / tradingview / discord)
- 总测试数 45+

## [0.6.0-alpha] - 2026-06-23

### Added
- Metrics / Health / Config / CLI
- E2E 测试

## [0.5.0-alpha] - 2026-06-23

### Added
- Mock LLM / Benchmark / 4 示例 / Marketing

## [0.4.0-alpha] - 2026-06-23

### Added
- 回测 + 性能指标 + Yahoo + 5 工具

## [0.3.0-alpha] - 2026-06-23

### Added
- 6 指标 + 4 策略 + Web UI + Pages

## [0.2.0-alpha] - 2026-06-23

### Added
- OKX + Binance + 4 告警 + CI/CD + Docker

## [0.1.0-alpha.1] - 2026-06-23

### Added
- 基础架构 + 8 工具 + 多 LLM + 7×24
