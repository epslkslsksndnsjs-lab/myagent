/**
 * 示例 5: 多数据源融合
 * CoinGecko + Yahoo + Binance 综合
 */

import { CoinGeckoClient } from '../src/data/coingecko';
import { YahooFinanceClient } from '../src/data/yahoo';

async function main() {
  console.log('=== 多数据源融合 ===\n');

  // 1. CoinGecko(加密货币)
  console.log('--- CoinGecko (加密) ---');
  const cg = new CoinGeckoClient();
  const crypto = await cg.getPrices(['BTC', 'ETH', 'SOL']);
  for (const [symbol, data] of Object.entries(crypto)) {
    console.log(`  ${symbol}: $${data.price.toFixed(2)} (${data.change24h.toFixed(2)}%)`);
  }

  // 2. Yahoo Finance(美股)
  console.log('\n--- Yahoo Finance (美股) ---');
  const yahoo = new YahooFinanceClient();
  try {
    const aapl = await yahoo.getQuote('AAPL');
    console.log(`  AAPL: $${aapl.price.toFixed(2)} (${aapl.changePercent.toFixed(2)}%)`);
  } catch (e) {
    console.log('  Yahoo 失败(可能限流):', (e as Error).message);
  }

  // 3. 综合判断
  console.log('\n--- 综合 ---');
  const allAssets = { ...crypto };
  for (const [symbol, data] of Object.entries(allAssets)) {
    const trend = data.change24h > 0 ? '🟢 up' : '🔴 down';
    console.log(`  ${symbol}: ${trend} ${Math.abs(data.change24h).toFixed(2)}%`);
  }
}

main().catch(console.error);
