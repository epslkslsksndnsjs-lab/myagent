/**
 * Yahoo Finance 免费行情
 * 文档: https://query1.finance.yahoo.com/v8/finance/chart
 *
 * 免费层(无需 key):
 *   - 美股 / 港股 / 期货
 *   - K 线 / 实时报价
 *   - 限制: 偶尔限流
 *
 * 不支持加密货币(用 CoinGecko)
 * 不支持 A 股(用其他源)
 */

import { logger } from '../utils/logger';

const BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

export interface YahooQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  timestamp: number;
}

export class YahooFinanceClient {
  /**
   * 拉取实时报价
   */
  async getQuote(symbol: string): Promise<YahooQuote> {
    const url = `${BASE_URL}/${encodeURIComponent(symbol)}?interval=1d&range=1d`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance HTTP ${response.status}`);
    }

    const data: any = await response.json();
    const result = data.chart?.result?.[0];
    if (!result) {
      throw new Error(`No data for ${symbol}`);
    }

    const meta = result.meta;
    const previousClose = meta.chartPreviousClose || meta.previousClose || 0;
    const price = meta.regularMarketPrice || 0;
    const change = price - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

    return {
      symbol,
      price,
      change,
      changePercent,
      volume: meta.regularMarketVolume || 0,
      marketCap: meta.marketCap,
      timestamp: meta.regularMarketTime * 1000,
    };
  }

  /**
   * 拉取 K 线
   */
  async getKlines(
    symbol: string,
    interval: string = '5m',
    range: string = '1d'
  ): Promise<any[]> {
    const url = `${BASE_URL}/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance HTTP ${response.status}`);
    }

    const data: any = await response.json();
    const result = data.chart?.result?.[0];
    if (!result) {
      return [];
    }

    const { timestamp, indicators } = result;
    const quotes = indicators.quote?.[0] || {};
    const candles = (timestamp || []).map((ts: number, i: number) => ({
      timestamp: ts * 1000,
      open: quotes.open?.[i],
      high: quotes.high?.[i],
      low: quotes.low?.[i],
      close: quotes.close?.[i],
      volume: quotes.volume?.[i],
    }));

    return candles;
  }

  /**
   * 批量报价
   */
  async getQuotes(symbols: string[]): Promise<Record<string, YahooQuote>> {
    const result: Record<string, YahooQuote> = {};

    await Promise.all(
      symbols.map(async (symbol) => {
        try {
          result[symbol] = await this.getQuote(symbol);
        } catch (e) {
          logger.error(`Yahoo Finance getQuote failed for ${symbol}:`, e);
          result[symbol] = { symbol, price: 0, change: 0, changePercent: 0, volume: 0, timestamp: Date.now() };
        }
      })
    );

    return result;
  }
}
