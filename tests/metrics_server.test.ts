import { describe, it, expect, afterAll } from 'vitest';
import { MetricsServer } from '../src/server/metrics_server';
import { Metrics } from '../src/observability/metrics';
import { HealthCheck } from '../src/observability/health';

describe('MetricsServer', () => {
  let server: MetricsServer | null = null;

  afterAll(() => {
    server?.stop();
  });

  it('should start and respond to /health/live', async () => {
    const metrics = new Metrics();
    const health = new HealthCheck();
    server = new MetricsServer(metrics, health, 9091);  // 用 9091 避免冲突
    await server.start();

    // 等待 server 启动
    await new Promise(r => setTimeout(r, 100));

    const response = await fetch('http://localhost:9091/health/live');
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain('uptime');
  });

  it('should expose /metrics', async () => {
    const metrics = new Metrics();
    metrics.inc('test_counter');
    const health = new HealthCheck();
    const s = new MetricsServer(metrics, health, 9092);
    await s.start();
    await new Promise(r => setTimeout(r, 100));

    const response = await fetch('http://localhost:9092/metrics');
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain('myagent_test_counter 1');

    s.stop();
  });
});
