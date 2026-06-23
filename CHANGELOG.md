# Changelog

## [0.6.0-alpha] - 2026-06-23

### Added
- **Metrics 框架** (`src/observability/metrics.ts`) - Counter/Gauge/Histogram,Prometheus 格式导出
- **Health Check** (`src/observability/health.ts`) - liveness/readiness 检查
- **E2E 端到端测试** (`tests/e2e.test.ts`) - 5 个完整流程测试
- **Config 系统** (`src/config/loader.ts`) - JSON 配置 + env 覆盖
- **CLI 命令** (`src/cli/commands.ts`) - myagent start/status/backtest/paper/config/help
- **Main 入口** 重写支持 CLI 子命令

### Tests
- 4 个新测试(metrics / config / cli)
- 总测试数 40+

## [0.5.0-alpha] - 2026-06-23

### Added
- Mock LLM / LLM Benchmark
- 4 个使用示例
- README 大幅优化
- Landing page + Logo + Release 脚本

## [0.4.0-alpha] - 2026-06-23

### Added
- 回测引擎 + 性能指标
- Yahoo Finance + 5 个风控工具

## [0.3.0-alpha] - 2026-06-23

### Added
- 6 指标 + 4 策略
- Web UI + GitHub Pages

## [0.2.0-alpha] - 2026-06-23

### Added
- OKX + Binance API + 4 告警
- 测试 + CI/CD + Docker

## [0.1.0-alpha.1] - 2026-06-23

### Added
- 基础架构
- 8 个 AI quant 工具
- 多 LLM 路由
- 7×24 主循环
