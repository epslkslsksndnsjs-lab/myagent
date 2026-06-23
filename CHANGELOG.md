# Changelog

## [0.4.0-alpha] - 2026-06-23

### Added
- Backtest engine(完整回测,支持手续费/滑点/夏普/最大回撤)
- Performance metrics(Sharpe/Sortino/Calmar/MaxDD/Volatility 等 12 项)
- Yahoo Finance client(美股/港股,免费)
- 5 个扩展 quant 工具:
  - calculate_position_size(根据风险算仓位)
  - check_drawdown(回撤检查)
  - calculate_kelly(Kelly 公式)
  - get_orderbook(订单簿快照,模拟)
  - calculate_slippage(滑点预估)
- GitHub Pages 启用指南(ENABLE-PAGES.md)
- 7 个新测试(回测/性能/风控/订单簿)
- 测试总数 25+

## [0.3.0-alpha] - 2026-06-23

### Added
- 5 个技术指标(SMA/EMA/MACD/RSI/Bollinger/ATR)
- 4 个策略(MA Cross/RSI/MACD/Bollinger)
- CoinGecko 免费行情
- Web UI(Vite + React)
- GitHub Pages 项目主页
- 完整使用示例

## [0.2.0-alpha] - 2026-06-23

### Added
- OKX + Binance 真实 API 框架
- 4 通道告警(钉钉/微信/Telegram/webhook)
- vitest 测试 + CI/CD + Docker + systemd
- LICENSE + TUTORIAL

## [0.1.0-alpha.1] - 2026-06-23

### Added
- 基础架构
- 8 个 AI quant 工具接口
- 多 LLM 路由
- 7×24 主循环
