/**
 * TradingView 集成
 *
 * TradingView 没有公开的免费 API
 * 实际方案:
 *   1. TradingView MCP(社区)
 *   2. 通过 TVWidget(嵌入式 widget)
 *   3. 第三方 API(Benzinga, Finage 等)
 *
 * 本实现:
 *   - 模拟 TV Lightweight Charts 数据格式
 *   - 借鉴 TV 数据模型
 *   - 实际接入用 MCP 或第三方
 *
 * 数据模型参考 TradingView UDF:
 *   https://www.tradingview.com/wiki/UDDF_protocol
 */

import { logger } from '../utils/logger';

export interface TVBar {
  time: number;        // Unix timestamp (seconds)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TVQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  time: number;
}

export class TradingViewClient {
  /**
   * 获取 K 线(UDDF 格式)
   * 实际接入:换实现,数据模型保持
   */
  async getBars(
    symbol: string,
    resolution: string = '5',
    from: number,
    to: number
  ): Promise<TVBar[]> {
    logger.debug(`TV getBars: ${symbol} ${resolution} ${from}-${to}`);

    // TODO: 接入 TradingView MCP
    // 现在返回 mock
    const bars: TVBar[] = [];
    let price = 67000;
    const interval = this.resolutionToSeconds(resolution);

    for (let t = from; t < to; t += interval) {
      const change = (Math.random() - 0.5) * 200;
      const open = price;
      price += change;
      const close = price;
      const high = Math.max(open, close) + Math.random() * 100;
      const low = Math.min(open, close) - Math.random() * 100;

      bars.push({
        time: t,
        open,
        high,
        low,
        close,
        volume: Math.random() * 1000 + 500,
      });
    }

    return bars;
  }

  /**
   * 获取报价
   */
  async getQuote(symbol: string): Promise<TVQuote> {
    return {
      symbol,
      price: 67000 + Math.random() * 1000,
      change: Math.random() * 200 - 100,
      changePercent: Math.random() * 4 - 2,
      volume: Math.random() * 100000,
      time: Math.floor(Date.now() / 1000),
    });
  }

  /**
   * 批量报价
   */
  async getQuotes(symbols: string[]): Promise<TVQuote[]> {
    return Promise.all(symbols.map(s => this.getQuote(s)));
  }

  /**
   * 解析 resolution 字符串到秒数
   */
  private resolutionToSeconds(resolution: string): number {
    const map: Record<string, number> = {
      '1': 60,
      '5': 300,
      '15': 900,
      '30': 1800,
      '60': 3600,
      '1D': 86400,
      '1W': 604800,
    };
    return map[resolution] || 300;
  }

  /**
   * 转换为内部 Candle 格式
   */
  static toInternalBars(tvBars: TVBar[]): any[] {
    return tvBars.map(bar => ({
      timestamp: bar.time * 1000,
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
      volume: bar.volume,
    }));
  }
}
