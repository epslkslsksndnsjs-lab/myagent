# Production Readiness Checklist

> **目标**:确保 myagent 可以安全部署到生产环境

## ✅ 核心要求

### 1. 配置管理
- [x] JSON config 加载
- [x] 环境变量覆盖
- [x] 默认值合理
- [x] 配置文件示例
- [x] CLI 模式切换

### 2. 可观测性
- [x] Prometheus metrics 导出
- [x] Health check 端点
- [x] liveness / readiness 分离
- [x] 业务指标(交易数/tick 延迟/LLM 延迟)
- [x] 错误指标

### 3. 告警
- [x] 多通道(钉钉/微信/Telegram/Discord/Slack/Webhook)
- [x] 严重程度分级
- [x] 失败重试(各通道独立)
- [x] Console fallback

### 4. 部署
- [x] Docker(单容器)
- [x] Docker Compose(完整栈)
- [x] systemd service
- [x] 一键安装脚本
- [x] 自动重启

### 5. 安全
- [x] 环境变量管理(.env,不 commit)
- [x] 资源限制(MemoryMax=2G)
- [x] 独立用户运行(myagent)
- [x] 签名 API 调用(OKX/Binance)
- [x] .gitignore 排除敏感数据

### 6. 监控与日志
- [x] 详细日志(logger)
- [x] 错误堆栈
- [x] state persist(state.json)
- [x] 优雅退出(SIGTERM)
- [ ] 集中日志(ELK) — 未来

### 7. 数据可靠性
- [x] state auto save(每 10 tick)
- [x] 崩溃恢复(loadState)
- [x] 工具调用错误处理(try/catch)
- [ ] 数据备份 — 未来

### 8. 性能
- [x] Mock LLM 兜底
- [x] LLM 失败降级链
- [x] 工具缓存(简化)
- [ ] LLM 响应缓存 — 未来

### 9. 测试
- [x] 单元测试(vitest)
- [x] E2E 测试
- [x] Mock 完整流程
- [x] 45+ 测试覆盖
- [ ] 性能压测 — 未来

### 10. 文档
- [x] README
- [x] TUTORIAL
- [x] ARCHITECTURE
- [x] ENABLE-PAGES
- [x] 6+ 文档(.md)
- [x] 7+ 完整示例
- [x] CONTRIBUTING
- [x] LICENSE

## 🚧 未来改进

### 中优先级
- [ ] 分布式部署(多 agent 协调)
- [ ] Web UI 完整版(替代 CLI)
- [ ] 策略市场(用户分享策略)
- [ ] 回测报告 PDF 导出
- [ ] 真实 TradingView MCP 接入

### 低优先级
- [ ] K8s Helm Chart
- [ ] Terraform 模块
- [ ] Prometheus + Grafana 完整 dashboard
- [ ] 实时 stream 处理(Kafka)

## 📊 current stats

| 维度 | ok? |
|---|---|
| 文件数 | 100+ |
| 代码行 | 6,500+ |
| 测试 | 45+ |
| 文档 | 7+ |
| 部署方式 | 3(Docker / systemd / 手动) |
| LLM | 5(Claude/GPT/DeepSeek/Qwen/Mock) |
| 数据源 | 3(CoinGecko/Yahoo/TV) |
| 交易所 | 2(OKX/Binance) |
| 工具 | 13 |
| 策略 | 4 |
| 指标 | 6 |
| 告警 | 6 通道 |

## 🚀 部署清单

### 第一次部署
1. 准备 Linux 服务器(Ubuntu 22.04+)
2. 安装 Bun: `curl -fsSL https://bun.sh/install | bash`
3. 克隆仓库: `git clone https://github.com/epslkslsksndnsjs-lab/myagent`
4. 运行: `sudo ./deploy/install.sh`
5. 编辑 .env(填 API key)
6. 重启: `sudo systemctl restart myagent`
7. verify: `curl http://localhost:9090/health`

### 升级
1. 拉新代码: `cd /opt/myagent && sudo -u myagent git pull`
2. 装新依赖: `sudo -u myagent bun install`
3. 重启: `sudo systemctl restart myagent`
4. verify: `curl http://localhost:9090/health`

### 监控接入
- 接入 Prometheus: `http://server:9090/metrics`
- 接入 Grafana: 加 Prometheus 数据源 + 用 /metrics
- 告警: 配置 AlertManager 接 /health

## 📞 故障排查

| 问题 | 解决 |
|---|---|
| 服务没启动 | `sudo journalctl -u myagent -n 50` |
| 工具调用失败 | 检查 API key + 网络 |
| LLM 失败 | 降级到 mock(检查 env) |
| 行情不准 | 换数据源(CoinGecko/Binance) |
| 内存爆 | 检查 state.json 清理 |
