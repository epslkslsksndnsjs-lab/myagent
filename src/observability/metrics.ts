/**
 * Metrics 收集 - 借鉴 Prometheus 思路,简化
 *
 * 指标:
 *   - Counter(只增):tick 次数、错误次数
 *   - Gauge(可增可减):当前持仓、当前价格
 *   - Histogram(分布):tick 延迟、LLM 延迟
 */

export class Metrics {
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();

  /**
   * 计数器 +1
   */
  inc(name: string, value: number = 1, labels?: Record<string, string>): void {
    const key = this.key(name, labels);
    this.counters.set(key, (this.counters.get(key) || 0) + value);
  }

  /**
   * 设置 gauge 值
   */
  set(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.key(name, labels);
    this.gauges.set(key, value);
  }

  /**
   * 记录 histogram 值
   */
  observe(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.key(name, labels);
    if (!this.histograms.has(key)) this.histograms.set(key, []);
    this.histograms.get(key)!.push(value);
  }

  /**
   * 导出所有指标(Prometheus 格式)
   */
  export(): string {
    const lines: string[] = [];

    // Counters
    for (const [key, value] of this.counters) {
      lines.push(`# TYPE myagent_${key} counter`);
      lines.push(`myagent_${key} ${value}`);
    }

    // Gauges
    for (const [key, value] of this.gauges) {
      lines.push(`# TYPE myagent_${key} gauge`);
      lines.push(`myagent_${key} ${value}`);
    }

    // Histograms (计算 p50/p95/p99)
    for (const [key, values] of this.histograms) {
      if (values.length === 0) continue;
      values.sort((a, b) => a - b);
      const p50 = values[Math.floor(values.length * 0.5)];
      const p95 = values[Math.floor(values.length * 0.95)];
      const p99 = values[Math.floor(values.length * 0.99)];
      const sum = values.reduce((a, b) => a + b, 0);

      lines.push(`# TYPE myagent_${key} histogram`);
      lines.push(`myagent_${key}_count ${values.length}`);
      lines.push(`myagent_${key}_sum ${sum}`);
      lines.push(`myagent_${key}_p50 ${p50}`);
      lines.push(`myagent_${key}_p95 ${p95}`);
      lines.push(`myagent_${key}_p99 ${p99}`);
    }

    return lines.join('\n');
  }

  /**
   * 重置
   */
  reset(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }

  private key(name: string, labels?: Record<string, string>): string {
    if (!labels) return name;
    const labelStr = Object.entries(labels).map(([k, v]) => `${k}=${v}`).join(',');
    return `${name}{${labelStr}}`;
  }
}

// 全局 metrics 实例
export const metrics = new Metrics();

// 业务指标(预定义)
export const MyMetrics = {
  // Counter
  tickTotal: () => metrics.inc('tick_total'),
  tradeTotal: (side: string) => metrics.inc('trade_total', 1, { side }),
  errorTotal: (type: string) => metrics.inc('error_total', 1, { type }),

  // Gauge
  setPortfolioValue: (value: number) => metrics.set('portfolio_value_usd', value),
  setPosition: (symbol: string, amount: number) => metrics.set('position_amount', amount, { symbol }),
  setDailyPnl: (value: number) => metrics.set('daily_pnl_usd', value),

  // Histogram
  observeTickDuration: (ms: number) => metrics.observe('tick_duration_ms', ms),
  observeLlmLatency: (provider: string, ms: number) => metrics.observe('llm_latency_ms', ms, { provider }),
  observeOrderSlippage: (symbol: string, slippage: number) => metrics.observe('order_slippage_pct', slippage, { symbol }),
};
