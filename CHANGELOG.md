# Changelog

## [0.2.0-alpha] - 2026-06-23

### Added
- OKX 交易所 API 框架(需 env 配置 API key)
- Binance 交易所 API 框架(需 env 配置 API key)
- vitest 测试框架 + 关键测试(tools, registry, context)
- GitHub Actions CI/CD
- Docker 支持(Dockerfile + docker-compose.yml)
- systemd service 文件(deploy/myagent.service)
- 一键部署脚本(deploy/install.sh)
- LICENSE (MIT)
- 改进文档(本文档)

### Status
- 8 个工具的 mock 实现可用
- 真实 API 框架就绪,等用户填 key
- 测试覆盖:tools/registry/context

## [0.1.0-alpha.1] - 2026-06-23

### Added
- 基础架构(main loop + agent + state + context)
- 8 个 AI quant 工具的接口定义
- 多 LLM 路由(Claude/OpenAI/DeepSeek/Qwen)
- System prompt
- 7×24 tick 驱动主循环
- README + ARCHITECTURE 文档

### Notes
- 初始 alpha 版本,所有工具返回 mock 数据
- 借鉴 Claude Code 2.1.88 架构(开源泄露)
- 借鉴 claude-code-router 多 LLM 模式
