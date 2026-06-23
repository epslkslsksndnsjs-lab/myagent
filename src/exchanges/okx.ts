/**
 * OKX 交易所 API 接入
 * 文档: https://www.okx.com/docs-v5/en/
 *
 * 真实 API 框架(需要 env 配置 OKX_API_KEY 等)
 * 没配置 = 抛错
 */

import { logger } from '../utils/logger';

export interface OKXConfig {
  apiKey: string;
  secret: string;
  passphrase: string;
  isTestnet?: boolean;
}

export class OKXClient {
  private config: OKXConfig;
  private baseUrl: string;

  constructor(config: OKXConfig) {
    this.config = config;
    this.baseUrl = 'https://www.okx.com';
  }

  async getKlines(symbol: string, bar: string = '5m', limit: number = 100): Promise<any[]> {
    const url = `${this.baseUrl}/api/v5/market/candles?instId=${symbol}&bar=${bar}&limit=${limit}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`OKX API error: ${response.status}`);
    const data: any = await response.json();
    if (data.code !== '0') throw new Error(`OKX API error: ${data.msg}`);
    return data.data;
  }

  async getTicker(symbol: string): Promise<any> {
    const url = `${this.baseUrl}/api/v5/market/ticker?instId=${symbol}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`OKX API error: ${response.status}`);
    const data: any = await response.json();
    if (data.code !== '0') throw new Error(`OKX API error: ${data.msg}`);
    return data.data[0];
  }

  async getTickers(symbols: string[]): Promise<Record<string, any>> {
    const result: Record<string, any> = {};
    await Promise.all(symbols.map(async (s) => {
      try { result[s] = await this.getTicker(s); }
      catch (e) { result[s] = { error: (e as Error).message }; }
    }));
    return result;
  }

  async placeOrder(params: { symbol: string; side: 'buy' | 'sell'; amount: number; type: 'market' | 'limit'; price?: number }): Promise<any> {
    this.ensureConfigured();
    logger.warn('OKX placeOrder: 真实签名 TODO,返回 mock');
    return { orderId: `mock-okx-${Date.now()}`, status: 'filled', ...params, _mock: true };
  }

  async getBalance(): Promise<any> {
    this.ensureConfigured();
    return { totalEq: '10000', availEq: '5000', _mock: true };
  }

  async getPositions(): Promise<any> {
    this.ensureConfigured();
    return { positions: [], _mock: true };
  }

  private ensureConfigured(): void {
    if (!this.config.apiKey || !this.config.secret || !this.config.passphrase) {
      throw new Error('OKX API not configured. Set OKX_API_KEY, OKX_SECRET, OKX_PASSPHRASE in .env');
    }
  }
}
