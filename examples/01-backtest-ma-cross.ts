/**
 * 示例 1: 回测 MA Cross 策略
 * 用 Binance 真实历史数据
 */

import { BacktestEngine } from '../src/backtest/engine';
import { MACrossStrategy } from '../src/strategies/ma_cross';
import { BinanceClient } from '../src/exchanges/binance';

async function main() {
  console.log('=== 回测 MA Cross 策略 (BTC 2024) ===\n');

  // 1. 拉历史数据
  const binance = new BinanceClient({ apiKey: '', secret: '' });
  console.log('拉取 BTC 5min K 线...');
  const rawCandles = await binance.getKlines('BTCUSDT', '5m', 1000);
  console.log(`拉到 ${rawCandles.length} 根 K 线`);

  // 2. 转换为内部格式
  const candles = rawCandles.map((c: any[]) => ({
    timestamp: c[0],
    open: parseFloat(c[1]),
    high: parseFloat(c[2]),
    low: parseFloat(c[3]),
    close: parseFloat(c[4]),
    volume: parseFloat(c[5]),
  }));

  // 3. 跑回测
  const strategy = new MACrossStrategy({ fast: 5, slow: 20 });
  const engine = new BacktestEngine({
    symbol: 'BTC/USDT',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    initialCapital: 10000,
    commission: 0.001,
    slippage: 0.0005,
    interval: '5m',
  }, strategy);

  console.log('跑回测...');
  const result = await engine.run(candles);

  // 4. 输出
  console.log('\n=== 结果 ===');
  console.log(`总收益: ${result.totalReturn.toFixed(2)}%`);
  console.log(`年化: ${result.annualizedReturn.toFixed(2)}%`);
  console.log(`夏普: ${result.sharpeRatio.toFixed(2)}`);
  console.log(`最大回撤: ${result.maxDrawdown.toFixed(2)}%`);
  console.log(`胜率: ${result.winRate.toFixed(2)}%`);
  console.log(`交易数: ${result.totalTrades}`);
  console.log(`最终资金: $${result.finalEquity.toFixed(2)}`);
}

main().catch(console.error);
