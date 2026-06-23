import { describe, it, expect } from 'vitest';
import { sma, ema, rsi, macd, bollinger, atr } from '../src/strategies/indicators';

describe('Indicators - Edge Cases', () => {
  describe('SMA - edge cases', () => {
    it('should handle empty array', () => {
      expect(sma([], 5)).toBe(0);
    });

    it('should handle single value', () => {
      expect(sma([100], 1)).toBe(100);
    });

    it('should handle exact period match', () => {
      expect(sma([1, 2, 3, 4, 5], 5)).toBe(3);
    });
  });

  describe('EMA - edge cases', () => {
    it('should handle single value', () => {
      expect(ema([100], 5)).toBe(100);
    });

    it('should be smoother than SMA for trending data', () => {
      const upTrend = Array.from({ length: 20 }, (_, i) => 100 + i);
      const emaVal = ema(upTrend, 10);
      const smaVal = sma(upTrend, 10);
      expect(emaVal).toBeGreaterThan(smaVal - 5);  // EMA 更接近最新
    });
  });

  describe('RSI - edge cases', () => {
    it('should be 100 for all gains', () => {
      const prices = Array.from({ length: 20 }, (_, i) => 100 + i);
      expect(rsi(prices, 14)).toBe(100);
    });

    it('should be 0 for all losses', () => {
      const prices = Array.from({ length: 20 }, (_, i) => 200 - i);
      expect(rsi(prices, 14)).toBe(0);
    });

    it('should be ~50 for sideways', () => {
      const prices = [100, 101, 100, 99, 100, 101, 100, 99, 100, 101, 100, 99, 100, 101, 100];
      const r = rsi(prices, 14);
      expect(r).toBeGreaterThan(30);
      expect(r).toBeLessThan(70);
    });
  });

  describe('MACD - edge cases', () => {
    it('should handle insufficient data', () => {
      const result = macd([1, 2, 3]);
      expect(result.macd).toBe(0);
    });
  });

  describe('Bollinger - edge cases', () => {
    it('should produce equal bands for constant prices', () => {
      const prices = Array(20).fill(100);
      const result = bollinger(prices, 20, 2);
      expect(result.upper).toBe(result.middle);
      expect(result.lower).toBe(result.middle);
    });
  });

  describe('ATR - edge cases', () => {
    it('should handle insufficient data', () => {
      const candles = [
        { timestamp: 0, open: 100, high: 105, low: 95, close: 100, volume: 1000 },
      ];
      expect(atr(candles, 14)).toBe(0);
    });
  });
});
