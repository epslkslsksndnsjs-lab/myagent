# Changelog

## [0.5.0-alpha] - 2026-06-23

### Added
- **Mock LLM** - 无需 API key 跑通完整流程(降级链兜底)
- **LLM Benchmark** - 对比 5 个 LLM 的 quant 决策质量(成本/延迟/准确)
- **4 个完整使用示例**:
  - `01-backtest-ma-cross.ts` - Binance 真实数据回测
  - `02-paper-trading.ts` - 完整 paper trading
  - `03-benchmark-llms.ts` - LLM 对比
  - `04-multi-strategy.ts` - 多策略组合投票
- **README 大幅优化** - 加 GitHub 徽章、产品对比、Star History
- **Landing page** (`docs/landing.html`) - 营销首页
- **ASCII logo** (`docs/logo.txt`)
- **Release 脚本** (`scripts/release.sh`) - 一键发版

### Tests
- 2 个新测试文件(router + benchmark)
- 总测试数 35+

## [0.4.0-alpha] - 2026-06-23

### Added
- Backtest engine
- Performance metrics (12 个)
- Yahoo Finance client
- 5 个扩展 quant 工具
- GitHub Pages 启用指南

## [0.3.0-alpha] - 2026-06-23

### Added
- 6 指标 + 4 策略
- CoinGecko 免费行情
- Web UI
- GitHub Pages

## [0.2.0-alpha] - 2026-06-23

### Added
- OKX + Binance API
- 4 通道告警
- 测试 + CI/CD + Docker

## [0.1.0-alpha.1] - 2026-06-23

### Added
- 基础架构
- 8 个 AI quant 工具接口
- 多 LLM 路由
- 7×24 主循环
