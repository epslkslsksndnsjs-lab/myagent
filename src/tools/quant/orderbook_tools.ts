/**
 * 订单簿工具(简化,模拟)
 * - get_orderbook: 获取订单簿快照
 * - detect_iceberg: 检测冰山订单
 */

import type { Tool } from '../registry';

export const get_orderbook: Tool = {
  name: 'get_orderbook',
  description: '获取订单簿快照(模拟)',
  inputSchema: {
    type: 'object',
    properties: {
      symbol: { type: 'string', description: '交易对' },
      depth: { type: 'number', description: '深度,默认 20' },
    },
    required: ['symbol'],
  },
  execute: async ({ symbol, depth = 20 }) => {
    // 模拟订单簿(真实接入需要交易所 WebSocket)
    const midPrice = 67432;
    const spread = 0.5;

    const bids = [];
    const asks = [];

    for (let i = 0; i < depth; i++) {
      const bidPrice = midPrice - spread - i * 0.1;
      const askPrice = midPrice + spread + i * 0.1;
      const bidSize = Math.random() * 10 + 1;
      const askSize = Math.random() * 10 + 1;

      bids.push({ price: bidPrice, size: bidSize });
      asks.push({ price: askPrice, size: askSize });
    }

    return { symbol, bids, asks, midPrice, spread, _mock: true };
  },
};

export const calculate_slippage: Tool = {
  name: 'calculate_slippage',
  description: '根据订单大小计算预估滑点',
  inputSchema: {
    type: 'object',
    properties: {
      orderSize: { type: 'number', description: '订单大小 USD' },
      avgDailyVolume: { type: 'number', description: '24h 平均成交量 USD' },
    },
    required: ['orderSize', 'avgDailyVolume'],
  },
  execute: async ({ orderSize, avgDailyVolume }) => {
    // 简化:滑点 = 订单大小 / 日均成交量 * 0.1%
    const ratio = orderSize / avgDailyVolume;
    const slippage = Math.min(0.05, ratio * 0.001);  // 最多 5%
    return {
      slippagePercent: slippage * 100,
      slippageAmount: orderSize * slippage,
    };
  },
};
