import { describe, it, expect } from 'vitest';
import { YahooFinanceClient } from '../src/data/yahoo';

describe('YahooFinanceClient', () => {
  it('should be instantiable', () => {
    const client = new YahooFinanceClient();
    expect(client).toBeInstanceOf(YahooFinanceClient);
  });

  // 真实 API 测试需要网络,跳过避免 CI 失败
  it.skip('should fetch AAPL quote (requires network)', async () => {
    const client = new YahooFinanceClient();
    const quote = await client.getQuote('AAPL');
    expect(quote.symbol).toBe('AAPL');
    expect(quote.price).toBeGreaterThan(0);
  });
});
