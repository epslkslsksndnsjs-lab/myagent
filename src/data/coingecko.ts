/**
 * CoinGecko 免费行情 API
 * 文档: https://www.coingecko.com/en/api/documentation
 *
 * 免费层限制:
 *   - 10-30 calls/min
 *   - 无需 API key
 *
 * 适合:
 *   - 启动时拉初始价格
 *   - verify exchange data
 *   - 离线/测试环境
 */

import { logger } from '../utils/logger';

const BASE_URL = 'https://api.coingecko.com/api/v3';

export interface CoinGeckoPrice {
  symbol: string;
  price: number;
  change24h: number;
  marketCap?: number;
  volume24h?: number;
}

export class CoinGeckoClient {
  /**
   * 拉多个币的当前价格
   */
  async getPrices(symbols: string[]): Promise<Record<string, CoinGeckoPrice>> {
    // CoinGecko 用 id,我们用 symbol 转换
    const ids = this.symbolsToIds(symbols);
    const url = `${BASE_URL}/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`;

    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`CoinGecko HTTP ${response.status}`);
      }

      const data: any = await response.json();
      const result: Record<string, CoinGeckoPrice> = {};

      for (const symbol of symbols) {
        const id = this.symbolToId(symbol);
        const item = data[id];
        if (item) {
          result[symbol] = {
            symbol,
            price: item.usd || 0,
            change24h: item.usd_24h_change || 0,
            marketCap: item.usd_market_cap,
            volume24h: item.usd_24h_vol,
          };
        }
      }

      return result;
    } catch (e) {
      logger.error('CoinGecko request failed:', e);
      throw e;
    }
  }

  /**
   * 拉单个币详情
   */
  async getCoin(id: string): Promise<any> {
    const url = `${BASE_URL}/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`CoinGecko HTTP ${response.status}`);
    return await response.json();
  }

  /**
   * 拉历史 OHLC(免费层)
   */
  async getOHLC(id: string, days: number = 1): Promise<any> {
    const url = `${BASE_URL}/coins/${id}/ohlc?vs_currency=usd&days=${days}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`CoinGecko HTTP ${response.status}`);
    return await response.json();
  }

  /**
   * 拉市场数据(top 100)
   */
  async getTopCoins(limit: number = 100): Promise<any[]> {
    const url = `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`CoinGecko HTTP ${response.status}`);
    return await response.json();
  }

  private symbolsToIds(symbols: string[]): string[] {
    return symbols.map(s => this.symbolToId(s));
  }

  private symbolToId(symbol: string): string {
    // 简单转换(symbol -> id)
    const map: Record<string, string> = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'SOL': 'solana',
      'BNB': 'binancecoin',
      'XRP': 'ripple',
      'ADA': 'cardano',
      'DOGE': 'dogecoin',
      'MATIC': 'matic-network',
      'DOT': 'polkadot',
      'AVAX': 'avalanche-2',
      'LINK': 'chainlink',
      'UNI': 'uniswap',
      'LTC': 'litecoin',
      'BCH': 'bitcoin-cash',
      'NEAR': 'near',
      'APT': 'aptos',
      'OP': 'optimism',
      'ARB': 'arbitrum',
      'TON': 'the-open-network',
      'TRX': 'tron',
    };
    const s = symbol.replace('/USDT', '').replace('-USD', '').toUpperCase();
    return map[s] || s.toLowerCase();
  }
}
