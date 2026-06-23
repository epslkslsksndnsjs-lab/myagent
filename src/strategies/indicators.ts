/**
 * 技术指标库 - 纯函数实现,无外部依赖
 *
 * 借鉴 vnpy ta-lib 思路,简化版(够 5-10 个核心指标)
 */

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * 简单移动平均线 (SMA)
 */
export function sma(prices: number[], period: number): number {
  if (prices.length < period) return 0;
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

/**
 * 指数移动平均线 (EMA)
 */
export function ema(prices: number[], period: number): number {
  if (prices.length < period) return 0;
  const k = 2 / (period + 1);
  let e = prices[0];
  for (let i = 1; i < prices.length; i++) {
    e = prices[i] * k + e * (1 - k);
  }
  return e;
}

/**
 * MACD
 */
export function macd(prices: number[], fast = 12, slow = 26, signal = 9): {
  macd: number;
  signal: number;
  histogram: number;
} {
  if (prices.length < slow + signal) {
    return { macd: 0, signal: 0, histogram: 0 };
  }

  // 计算 EMA 序列
  const emaFast = emaSeries(prices, fast);
  const emaSlow = emaSeries(prices, slow);
  const macdLine = emaFast.map((v, i) => v - emaSlow[i]);

  // Signal = MACD 的 9 周期 EMA
  const signalLine = emaSeries(macdLine, signal);

  const lastMacd = macdLine[macdLine.length - 1];
  const lastSignal = signalLine[signalLine.length - 1];
  const histogram = lastMacd - lastSignal;

  return { macd: lastMacd, signal: lastSignal, histogram };
}

function emaSeries(prices: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const result: number[] = [prices[0]];
  for (let i = 1; i < prices.length; i++) {
    result.push(prices[i] * k + result[i - 1] * (1 - k));
  }
  return result;
}

/**
 * RSI (相对强弱指数)
 */
export function rsi(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = prices.length - period; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }

  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - 100 / (1 + rs);
}

/**
 * 布林带 (Bollinger Bands)
 */
export function bollinger(
  prices: number[],
  period: number = 20,
  stdDev: number = 2
): { upper: number; middle: number; lower: number } {
  const middle = sma(prices, period);
  const slice = prices.slice(-period);
  const variance = slice.reduce((sum, p) => sum + (p - middle) ** 2, 0) / period;
  const std = Math.sqrt(variance);

  return {
    upper: middle + stdDev * std,
    middle,
    lower: middle - stdDev * std,
  };
}

/**
 * ATR (平均真实波幅) - 用于仓位管理
 */
export function atr(candles: Candle[], period: number = 14): number {
  if (candles.length < period + 1) return 0;

  const trs: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;
    const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
    trs.push(tr);
  }

  return trs.slice(-period).reduce((a, b) => a + b, 0) / period;
}
