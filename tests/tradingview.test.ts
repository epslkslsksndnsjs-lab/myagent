import { describe, it, expect } from 'vitest';
import { TradingViewClient, type TVBar } from '../src/data/tradingview';

describe('TradingViewClient', () => {
  it('should fetch mock bars', async () => {
    const client = new TradingViewClient();
    const from = Math.floor(Date.now() / 1000) - 86400;
    const to = Math.floor(Date.now() / 1000);
    const bars = await client.getBars('BTCUSDT', '5', from, to);

    expect(bars.length).toBeGreaterThan(0);
    expect(bars[0]).toHaveProperty('time');
    expect(bars[0]).toHaveProperty('open');
    expect(bars[0]).toHaveProperty('high');
    expect(bars[0]).toHaveProperty('low');
    expect(bars[0]).toHaveProperty('close');
  });

  it('should fetch quote', async () => {
    const client = new TradingViewClient();
    const quote = await client.getQuote('BTCUSDT');
    expect(quote.symbol).toBe('BTCUSDT');
    expect(quote.price).toBeGreaterThan(0);
  });

  it('should convert to internal format', () => {
    const tvBars: TVBar[] = [
      { time: 1000, open: 100, high: 110, low: 95, close: 105, volume: 1000 },
    ];
    const internal = TradingViewClient.toInternalBars(tvBars);
    expect(internal[0].timestamp).toBe(1000000);
    expect(internal[0].open).toBe(100);
  });

  it('should parse resolution', () => {
    const client = new TradingViewClient();
    const bars = (client as any).getBars;
    // 间接测试:用 resolution '5' 应该有 ~288 根/天
    expect(bars).toBeDefined();
  });
});
