/**
 * 健康检查 - 借鉴 K8s liveness/readiness 思路,简化
 *
 * 暴露:
 *   - /health (整体健康)
 *   - /health/live (liveness)
 *   - /health/ready (readiness)
 */

import { logger } from '../utils/logger';

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  uptime: number;
  checks: Record<string, ComponentHealth>;
  timestamp: number;
}

export interface ComponentHealth {
  status: 'ok' | 'degraded' | 'down';
  message?: string;
  latencyMs?: number;
  lastCheck: number;
}

export class HealthCheck {
  private startTime = Date.now();
  private components: Map<string, () => Promise<ComponentHealth>> = new Map();

  /**
   * 注册组件检查
   */
  register(name: string, check: () => Promise<ComponentHealth>): void {
    this.components.set(name, check);
  }

  /**
   * 跑所有检查
   */
  async checkAll(): Promise<HealthStatus> {
    const checks: Record<string, ComponentHealth> = {};
    let worstStatus: 'ok' | 'degraded' | 'down' = 'ok';

    await Promise.all(
      Array.from(this.components.entries()).map(async ([name, check]) => {
        try {
          const start = Date.now();
          const result = await Promise.race([
            check(),
            new Promise<ComponentHealth>((_, reject) =>
              setTimeout(() => reject(new Error('timeout')), 5000)
            ),
          ]);
          result.latencyMs = Date.now() - start;
          checks[name] = result;

          if (result.status === 'down') worstStatus = 'down';
          else if (result.status === 'degraded' && worstStatus === 'ok') worstStatus = 'degraded';
        } catch (e) {
          checks[name] = {
            status: 'down',
            message: (e as Error).message,
            lastCheck: Date.now(),
          };
          worstStatus = 'down';
        }
      })
    );

    return {
      status: worstStatus,
      uptime: Date.now() - this.startTime,
      checks,
      timestamp: Date.now(),
    };
  }

  /**
   * liveness(只检查进程活着)
   */
  liveness(): { status: 'ok'; uptime: number } {
    return { status: 'ok', uptime: Date.now() - this.startTime };
  }

  /**
   * readiness(检查依赖)
   */
  async readiness(): Promise<HealthStatus> {
    return this.checkAll();
  }
}
