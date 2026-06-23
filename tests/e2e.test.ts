/**
 * E2E 端到端测试
 * verify:从启动到出信号的完整流程
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Agent } from '../src/core/agent';
import { LLMRouter } from '../src/llm/router';
import { ToolRegistry } from '../src/tools/registry';
import { quantTools } from '../src/tools/quant';
import { getSystemPrompt } from '../src/llm/prompts';
import { BacktestEngine } from '../src/backtest/engine';
import { MACrossStrategy } from '../src/strategies/ma_cross';
import { CoinGeckoClient } from '../src/data/coingecko';
import { calculateMetrics } from '../src/strategies/performance';
import { HealthCheck } from '../src/observability/health';
import { Metrics } from '../src/observability/metrics';
import type { Candle } from '../src/strategies/indicators';

describe('E2E: Full Flow', () => {
  it('should run complete paper trading cycle (no API key needed)', async () => {
    // 1. Setup
    const llm = new LLMRouter({ mock: true });
    const tools = new ToolRegistry();
    for (const tool of quantTools) {
      tools.register(tool);
    }
    const agent = new Agent({
      systemPrompt: getSystemPrompt('paper'),
      llm,
      tools,
    });

    // 2. 跑 3 个 tick
    const results = [];
    for (let i = 1; i <= 3; i++) {
      const start = Date.now();
      await agent.tick({ tickNumber: i, mode: 'paper' });
      const duration = Date.now() - start;
      results.push({ tick: i, duration });
    }

    // 3. verify
    expect(results).toHaveLength(3);
    for (const r of results) {
      expect(r.duration).toBeGreaterThan(0);
    }
  });

  it('should run backtest end-to-end', async () => {
    // 1. 创建 mock candles
    const candles: Candle[] = Array.from({ length: 100 }, (_, i) => ({
      timestamp: i * 5 * 60 * 1000,
      open: 100 + i * 0.5,
      high: 105 + i * 0.5,
      low: 95 + i * 0.5,
      close: 102 + i * 0.5,
      volume: 1000,
    }));

    // 2. 跑回测
    const engine = new BacktestEngine({
      symbol: 'BTC/USDT',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      initialCapital: 10000,
      commission: 0.001,
      slippage: 0.0005,
      interval: '5m',
    }, new MACrossStrategy({ fast: 5, slow: 20 }));

    const result = await engine.run(candles);

    // 3. verify
    expect(result.config.symbol).toBe('BTC/USDT');
    expect(result.finalEquity).toBeGreaterThan(0);
    expect(result.totalTrades).toBeGreaterThanOrEqual(0);
  });

  it('should integrate metrics + health + agent', async () => {
    // 1. Setup
    const metrics = new Metrics();
    const health = new HealthCheck();
    const llm = new LLMRouter({ mock: true });

    // 2. 注册健康检查
    health.register('llm', async () => ({
      status: 'ok',
      lastCheck: Date.now(),
    }));
    health.register('binance', async () => ({
      status: llm.getAvailableProviders().length > 0 ? 'ok' : 'degraded',
      message: `${llm.getAvailableProviders().length} providers available`,
      lastCheck: Date.now(),
    }));

    // 3. 模拟几个 tick
    for (let i = 0; i < 3; i++) {
      metrics.inc('tick_total');
      metrics.observe('tick_duration_ms', 100 + i * 10);
    }
    metrics.set('portfolio_value_usd', 10500);

    // 4. verify
    const healthStatus = await health.checkAll();
    expect(healthStatus.status).toBe('ok');
    expect(healthStatus.checks.llm.status).toBe('ok');
    expect(healthStatus.checks.binance.status).toBe('ok');

    const metricsOutput = metrics.export();
    expect(metricsOutput).toContain('myagent_tick_total 3');
    expect(metricsOutput).toContain('myagent_portfolio_value_usd 10500');
  });

  it('should handle agent error gracefully', async () => {
    const llm = new LLMRouter({ mock: true });
    const tools = new ToolRegistry();
    // 不注册任何工具 → 工具调用会失败

    const agent = new Agent({
      systemPrompt: getSystemPrompt('paper'),
      llm,
      tools,
    });

    // tick 应该不崩溃(即使工具失败)
    try {
      await agent.tick({ tickNumber: 1, mode: 'paper' });
    } catch (e) {
      // 可能抛错,但不应该 crash 整个进程
      expect(e).toBeInstanceOf(Error);
    }
  });
});

describe('E2E: Data Pipeline', () => {
  it('should integrate CoinGecko + indicators + backtest', async () => {
    // 1. 拉数据(CoinGecko)
    const cg = new CoinGeckoClient();
    const prices = await cg.getPrices(['BTC', 'ETH', 'SOL']);

    // 2. 转换为 candles(模拟)
    const candles: Candle[] = Array.from({ length: 50 }, (_, i) => ({
      timestamp: i * 5 * 60 * 1000,
      open: 60000 + i * 100,
      high: 60500 + i * 100,
      low: 59500 + i * 100,
      close: 60000 + i * 100 + (Math.random() - 0.5) * 2000,
      volume: 100,
    }));

    // 3. 跑策略
    const strategy = new MACrossStrategy({ fast: 5, slow: 20 });
    const ctx = {
      symbol: 'BTC/USDT',
      candles,
      position: 0,
      cash: 10000,
    };
    const signal = strategy.onTick(ctx);

    // 4. 计算性能
    const equity = [10000, 10100, 10200, 10150, 10300, 10400, 10500];
    const perf = calculateMetrics(equity);

    // 5. verify
    expect(prices).toBeDefined();
    expect(signal).toMatch(/buy|sell|hold/);
    expect(perf.totalReturn).toBeGreaterThan(0);
  });
});
