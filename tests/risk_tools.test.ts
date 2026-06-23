import { describe, it, expect } from 'vitest';
import { calculate_position_size, check_drawdown, calculate_kelly } from '../src/tools/quant/risk_tools';
import { get_orderbook, calculate_slippage } from '../src/tools/quant/orderbook_tools';

describe('Risk Tools', () => {
  describe('calculate_position_size', () => {
    it('should calculate position size based on risk', async () => {
      const result = await calculate_position_size.execute({
        accountBalance: 10000,
        entryPrice: 100,
        stopLoss: 95,
      });
      expect(result.riskAmount).toBe(50); // 0.5% of 10000
      expect(result.positionSize).toBe(10); // 50 / 5
    });
  });

  describe('check_drawdown', () => {
    it('should detect critical drawdown', async () => {
      const result = await check_drawdown.execute({
        peakEquity: 10000,
        currentEquity: 8000,  // -20%
        maxDrawdownPercent: 0.15,
      });
      expect(result.drawdown).toBe(20);
      expect(result.shouldStop).toBe(true);
    });

    it('should not trigger on small drawdown', async () => {
      const result = await check_drawdown.execute({
        peakEquity: 10000,
        currentEquity: 9500,  // -5%
        maxDrawdownPercent: 0.15,
      });
      expect(result.shouldStop).toBe(false);
    });
  });

  describe('calculate_kelly', () => {
    it('should calculate Kelly percentage', async () => {
      const result = await calculate_kelly.execute({
        winRate: 0.6,
        avgWin: 100,
        avgLoss: 50,
      });
      // Kelly = 0.6 - 0.4 / 2 = 0.4
      expect(result.kelly).toBeGreaterThan(0);
    });
  });
});

describe('Order Book Tools', () => {
  it('should return mock orderbook', async () => {
    const result = await get_orderbook.execute({ symbol: 'BTC/USDT', depth: 5 });
    expect(result.bids.length).toBe(5);
    expect(result.asks.length).toBe(5);
    expect(result.bids[0].price).toBeLessThan(result.asks[0].price);
  });

  it('should calculate slippage', async () => {
    const result = await calculate_slippage.execute({
      orderSize: 1000,
      avgDailyVolume: 100000,
    });
    expect(result.slippagePercent).toBeGreaterThan(0);
    expect(result.slippageAmount).toBeGreaterThan(0);
  });
});
