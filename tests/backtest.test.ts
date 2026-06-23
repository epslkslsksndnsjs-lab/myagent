import { describe, it, expect } from 'vitest';
import { BacktestEngine, type BacktestConfig } from '../src/backtest/engine';
import { MACrossStrategy } from '../src/strategies/ma_cross';
import { calculateMetrics } from '../src/strategies/performance';
import type { Candle } from '../src/strategies/indicators';

function generateCandles(count: number, trend: 'up' | 'down' | 'sideways' = 'up'): Candle[] {
  const candles: Candle[] = [];
  let price = 100;

  for (let i = 0; i < count; i++) {
    let change = 0;
    if (trend === 'up') change = 0.5;
    else if (trend === 'down') change = -0.5;
    else change = (Math.random() - 0.5) * 2;

    price += change;
    const open = price - change;
    const close = price;
    const high = Math.max(open, close) + Math.random();
    const low = Math.min(open, close) - Math.random();

    candles.push({
      timestamp: i * 5 * 60 * 1000,
      open, high, low, close,
      volume: 1000,
    });
  }
  return candles;
}

describe('BacktestEngine', () => {
  it('should run backtest on uptrend data', async () => {
    const config: BacktestConfig = {
      symbol: 'BTC/USDT',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      initialCapital: 10000,
      commission: 0.001,
      slippage: 0.0005,
      interval: '5m',
    };

    const strategy = new MACrossStrategy({ fast: 5, slow: 20 });
    const engine = new BacktestEngine(config, strategy);
    const candles = generateCandles(200, 'up');
    const result = await engine.run(candles);

    expect(result.config).toBe(config);
    expect(result.totalTrades).toBeGreaterThanOrEqual(0);
    expect(result.finalEquity).toBeGreaterThan(0);
  });

  it('should handle no signals (always hold)', async () => {
    const config: BacktestConfig = {
      symbol: 'BTC/USDT',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      initialCapital: 10000,
      commission: 0.001,
      slippage: 0.0005,
      interval: '5m',
    };

    // 用慢速均线,不会产生信号
    const strategy = new MACrossStrategy({ fast: 200, slow: 300 });
    const engine = new BacktestEngine(config, strategy);
    const candles = generateCandles(100);
    const result = await engine.run(candles);

    // 不应该有交易
    expect(result.totalTrades).toBe(0);
    expect(result.finalEquity).toBe(10000);  // 接近初始资金
  });
});

describe('Performance Metrics', () => {
  it('should calculate metrics for growing equity', () => {
    const equity = [100, 110, 120, 115, 130, 140, 145];
    const metrics = calculateMetrics(equity);

    expect(metrics.totalReturn).toBeGreaterThan(0);
    expect(metrics.sharpeRatio).toBeGreaterThan(0);
    expect(metrics.maxDrawdown).toBeGreaterThan(0);  // 有 120 -> 115
  });

  it('should return zero metrics for empty data', () => {
    const metrics = calculateMetrics([]);
    expect(metrics.sharpeRatio).toBe(0);
  });
});
