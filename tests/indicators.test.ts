import { describe, it, expect } from 'vitest';
import { sma, ema, rsi, macd, bollinger, atr, type Candle } from '../src/strategies/indicators';

describe('Technical Indicators', () => {
  describe('SMA', () => {
    it('should calculate simple moving average', () => {
      expect(sma([1, 2, 3, 4, 5], 3)).toBe(4);
      expect(sma([10, 20, 30], 3)).toBe(20);
    });

    it('should return 0 if insufficient data', () => {
      expect(sma([1, 2], 5)).toBe(0);
    });
  });

  describe('EMA', () => {
    it('should calculate exponential moving average', () => {
      const result = ema([1, 2, 3, 4, 5], 3);
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('RSI', () => {
    it('should return 100 for all gains', () => {
      const prices = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
      expect(rsi(prices, 14)).toBe(100);
    });

    it('should return 50 for neutral (insufficient data)', () => {
      expect(rsi([1, 2], 14)).toBe(50);
    });
  });

  describe('MACD', () => {
    it('should calculate MACD', () => {
      const prices = Array.from({ length: 50 }, (_, i) => 100 + i);
      const result = macd(prices);
      expect(result).toHaveProperty('macd');
      expect(result).toHaveProperty('signal');
      expect(result).toHaveProperty('histogram');
    });
  });

  describe('Bollinger Bands', () => {
    it('should calculate upper, middle, lower', () => {
      const prices = Array.from({ length: 30 }, (_, i) => 100 + i);
      const result = bollinger(prices, 20);
      expect(result.upper).toBeGreaterThan(result.middle);
      expect(result.lower).toBeLessThan(result.middle);
    });
  });

  describe('ATR', () => {
    it('should calculate average true range', () => {
      const candles: Candle[] = Array.from({ length: 20 }, (_, i) => ({
        timestamp: i,
        open: 100,
        high: 110,
        low: 95,
        close: 105,
        volume: 1000,
      }));
      const result = atr(candles);
      expect(result).toBeGreaterThan(0);
    });
  });
});

describe('Strategies', () => {
  it('should have MA Cross strategy', async () => {
    const { MACrossStrategy } = await import('../src/strategies/ma_cross');
    const strategy = new MACrossStrategy({ fast: 5, slow: 20 });
    expect(strategy.name).toBe('MA Cross');
  });

  it('should have RSI strategy', async () => {
    const { RSIStrategy } = await import('../src/strategies/rsi_strategy');
    const strategy = new RSIStrategy({ period: 14, oversold: 30, overbought: 70 });
    expect(strategy.name).toBe('RSI Mean Reversion');
  });
});
