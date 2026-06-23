/**
 * 示例 6: Prometheus metrics exporter
 * 暴露 /metrics 端点
 */

import { Metrics, MyMetrics } from '../src/observability/metrics';
import { HealthCheck } from '../src/observability/health';
import { MetricsServer } from '../src/server/metrics_server';

async function main() {
  console.log('=== Metrics Exporter ===\n');

  const metrics = new Metrics();
  const health = new HealthCheck();

  // 模拟一些业务指标
  MyMetrics.tickTotal();
  MyMetrics.tickTotal();
  MyMetrics.tradeTotal('buy');
  MyMetrics.tradeTotal('sell');
  MyMetrics.setPortfolioValue(10500);
  MyMetrics.observeTickDuration(150);
  MyMetrics.observeTickDuration(220);
  MyMetrics.observeLlmLatency('anthropic', 800);
  MyMetrics.observeLlmLatency('deepseek', 1200);

  // 注册健康检查
  health.register('myagent', async () => ({
    status: 'ok',
    message: 'All systems operational',
    lastCheck: Date.now(),
  }));

  // 启动 server
  const server = new MetricsServer(metrics, health, 9090);
  await server.start();

  console.log('  Server: http://localhost:9090');
  console.log('  Metrics: http://localhost:9090/metrics');
  console.log('  Health: http://localhost:9090/health');
  console.log('  Live: http://localhost:9090/health/live');
  console.log('  Ready: http://localhost:9090/health/ready');
  console.log('\n  按 Ctrl+C 退出\n');

  // 保持运行
  process.on('SIGINT', () => {
    server.stop();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    server.stop();
    process.exit(0);
  });

  // 保持 alive
  setInterval(() => {}, 1 << 30);
}

main().catch(console.error);
