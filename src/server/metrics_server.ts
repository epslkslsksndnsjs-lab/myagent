/**
 * Prometheus metrics HTTP server
 *
 * 暴露:
 *   - GET /metrics       (Prometheus 格式)
 *   - GET /health        (健康检查)
 *   - GET /health/live   (liveness)
 *   - GET /health/ready  (readiness)
 *
 * 借鉴 prom-client 思路,简化
 */

import { Metrics } from '../observability/metrics';
import { HealthCheck } from '../observability/health';
import { logger } from '../utils/logger';

export class MetricsServer {
  private server: any = null;
  private port: number;

  constructor(
    private metrics: Metrics,
    private health: HealthCheck,
    port: number = 9090
  ) {
    this.port = port;
  }

  /**
   * 启动 HTTP server
   */
  async start(): Promise<void> {
    const { createServer } = await import('http');

    this.server = createServer(async (req: any, res: any) => {
      const url = new URL(req.url || '/', `http://localhost`);
      const path = url.pathname;

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');

      try {
        if (path === '/metrics') {
          res.statusCode = 200;
          res.end(this.metrics.export());
        } else if (path === '/health') {
          const status = await this.health.checkAll();
          res.statusCode = status.status === 'down' ? 503 : 200;
          res.end(JSON.stringify(status, null, 2));
        } else if (path === '/health/live') {
          res.statusCode = 200;
          res.end(JSON.stringify(this.health.liveness(), null, 2));
        } else if (path === '/health/ready') {
          const status = await this.health.readiness();
          res.statusCode = status.status === 'down' ? 503 : 200;
          res.end(JSON.stringify(status, null, 2));
        } else {
          res.statusCode = 404;
          res.end('Not Found');
        }
      } catch (e) {
        res.statusCode = 500;
        res.end(`Error: ${(e as Error).message}`);
      }
    });

    this.server.listen(this.port, () => {
      logger.info(`Metrics server listening on http://localhost:${this.port}/metrics`);
    });
  }

  /**
   * 停止
   */
  stop(): void {
    if (this.server) {
      this.server.close();
      this.server = null;
      logger.info('Metrics server stopped');
    }
  }
}
