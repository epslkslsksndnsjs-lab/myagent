/**
 * 示例 4: 多策略组合(ensemble)
 */

import { MACrossStrategy } from '../src/strategies/ma_cross';
import { RSIStrategy } from '../src/strategies/rsi_strategy';
import { MACDTrendStrategy } from '../src/strategies/macd_strategy';
import { BollingerStrategy } from '../src/strategies/bollinger_strategy';

async function main() {
  console.log('=== 多策略组合 ===\n');

  const strategies = [
    new MACrossStrategy({ fast: 5, slow: 20 }),
    new RSIStrategy({ period: 14, oversold: 30, overbought: 70 }),
    new MACDTrendStrategy(),
    new BollingerStrategy({ period: 20, stdDev: 2 }),
  ];

  // 模拟数据
  const mockCandles = Array.from({ length: 30 }, (_, i) => ({
    timestamp: i * 5 * 60 * 1000,
    open: 100 + i + Math.random() * 2,
    high: 110 + i,
    low: 95 + i,
    close: 105 + i + Math.random() * 2,
    volume: 1000,
  }));

  const ctx = {
    symbol: 'BTC/USDT',
    candles: mockCandles,
    position: 0,
    cash: 10000,
  };

  console.log('投票中(4 个策略)...\n');
  const votes: Record<string, number> = { buy: 0, sell: 0, hold: 0 };
  const reasons: string[] = [];

  for (const strategy of strategies) {
    const signal = strategy.onTick(ctx);
    votes[signal]++;
    reasons.push(`${strategy.name}: ${signal}`);
  }

  console.log('各策略决策:');
  for (const r of reasons) console.log(`  ${r}`);

  // 多数决
  const winner = Object.entries(votes).sort((a, b) => b[1] - a[1])[0][0];
  console.log(`\n投票结果: ${winner.toUpperCase()} (${votes[winner]} 票)`);
}

main().catch(console.error);
