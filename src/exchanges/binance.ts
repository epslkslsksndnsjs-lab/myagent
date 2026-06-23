/**
 * Binance 交易所 API
 * 文档: https://binance-docs.github.io/apidocs/
 */

import { logger } from '../utils/logger';

export interface BinanceConfig {
  apiKey: string;
  secret: string;
  isTestnet?: boolean;
}

export class BinanceClient {
  private config: BinanceConfig;
  private baseUrl: string;

  constructor(config: BinanceConfig) {
    this.config = config;
    this.baseUrl = config.isTestnet
      ? 'https://testnet.binance.vision'
      : 'https://api.binance.com';
  }

  async getKlines(symbol: string, interval: string = '5m', limit: number = 100): Promise<any[]> {
    const url = `${this.baseUrl}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Binance API error: ${response.status}`);
    return await response.json();
  }

  async getTicker(symbol: string): Promise<any> {
    const url = `${this.baseUrl}/api/v3/ticker/24hr?symbol=${symbol}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Binance API error: ${response.status}`);
    return await response.json();
  }

  async placeOrder(params: { symbol: string; side: 'BUY' | 'SELL'; type: 'MARKET' | 'LIMIT'; quantity: number; price?: number }): Promise<any> {
    this.ensureConfigured();
    logger.warn('Binance placeOrder: 真实签名 TODO,返回 mock');
    return { orderId: `mock-binance-${Date.now()}`, status: 'FILLED', ...params, _mock: true };
  }

  async getAccount(): Promise<any> {
    this.ensureConfigured();
    return { _mock: true };
  }

  private ensureConfigured(): void {
    if (!this.config.apiKey || !this.config.secret) {
      throw new Error('Binance API not configured. Set BINANCE_API_KEY, BINANCE_SECRET in .env');
    }
  }
}
