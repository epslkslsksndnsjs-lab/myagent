import { describe, it, expect } from 'vitest';
import { get_market_data, place_order, get_balance, get_positions, get_historical_data } from '../src/tools/quant';

describe('Quant Tools', () => {
  describe('get_market_data', () => {
    it('should return mock data for given symbols', async () => {
      const result = await get_market_data.execute({ symbols: ['BTC/USDT', 'ETH/USDT'] });
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('BTC/USDT');
      expect(result.data).toHaveProperty('ETH/USDT');
    });

    it('should handle empty symbols array', async () => {
      const result = await get_market_data.execute({ symbols: [] });
      expect(result.data).toEqual({});
    });
  });

  describe('place_order', () => {
    it('should return mock order with required fields', async () => {
      const result = await place_order.execute({
        symbol: 'BTC/USDT',
        side: 'buy',
        amount: 0.1,
        type: 'market',
      });
      expect(result).toHaveProperty('orderId');
      expect(result).toHaveProperty('status', 'filled');
      expect(result.symbol).toBe('BTC/USDT');
      expect(result.side).toBe('buy');
      expect(result.amount).toBe(0.1);
    });

    it('should accept limit orders with price', async () => {
      const result = await place_order.execute({
        symbol: 'ETH/USDT',
        side: 'sell',
        amount: 1,
        type: 'limit',
        price: 3500,
      });
      expect(result.type).toBe('limit');
      expect(result.price).toBe(3500);
    });
  });

  describe('get_balance', () => {
    it('should return account balance', async () => {
      const result = await get_balance.execute({});
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('available');
      expect(result).toHaveProperty('inPositions');
      expect(result.total).toBeGreaterThan(0);
    });
  });

  describe('get_positions', () => {
    it('should return positions array', async () => {
      const result = await get_positions.execute({});
      expect(result).toHaveProperty('positions');
      expect(Array.isArray(result.positions)).toBe(true);
    });
  });

  describe('get_historical_data', () => {
    it('should return K-line data with default limit', async () => {
      const result = await get_historical_data.execute({
        symbol: 'BTC/USDT',
        interval: '5m',
      });
      expect(result.symbol).toBe('BTC/USDT');
      expect(result.interval).toBe('5m');
      expect(result.limit).toBe(100);
    });

    it('should accept custom limit', async () => {
      const result = await get_historical_data.execute({
        symbol: 'BTC/USDT',
        interval: '1h',
        limit: 500,
      });
      expect(result.limit).toBe(500);
    });
  });
});
