/**
 * 8 个核心 quant 工具 + 扩展工具
 */

import { Tool } from '../registry';
import { send_alert } from './send_alert';
import { calculate_position_size, check_drawdown, calculate_kelly } from './risk_tools';
import { get_orderbook, calculate_slippage } from './orderbook_tools';

// 1. 实时行情
export const get_market_data: Tool = {
  name: 'get_market_data',
  description: '获取多个交易对的实时行情',
  inputSchema: {
    type: 'object',
    properties: {
      symbols: { type: 'array', items: { type: 'string' } },
    },
    required: ['symbols'],
  },
  execute: async ({ symbols }) => {
    return {
      timestamp: Date.now(),
      data: symbols.reduce((acc: any, s: string) => {
        acc[s] = { price: 0, change24h: 0, volume24h: 0, _mock: true };
        return acc;
      }, {}),
    };
  },
};

// 2. 下单
export const place_order: Tool = {
  name: 'place_order',
  description: '在交易所下单',
  inputSchema: {
    type: 'object',
    properties: {
      symbol: { type: 'string' },
      side: { type: 'string', enum: ['buy', 'sell'] },
      amount: { type: 'number' },
      type: { type: 'string', enum: ['market', 'limit'] },
      price: { type: 'number' },
    },
    required: ['symbol', 'side', 'amount', 'type'],
  },
  execute: async (input) => {
    return { orderId: `mock-${Date.now()}`, status: 'filled', ...input, _mock: true };
  },
};

// 3-8. 其他工具(简化)
export const get_balance: Tool = {
  name: 'get_balance',
  description: '查询账户余额',
  inputSchema: { type: 'object', properties: {} },
  execute: async () => ({ total: 10000, available: 5000, inPositions: 5000, _mock: true }),
};

export const get_positions: Tool = {
  name: 'get_positions',
  description: '查询当前持仓',
  inputSchema: { type: 'object', properties: {} },
  execute: async () => ({ positions: [], _mock: true }),
};

export const get_historical_data: Tool = {
  name: 'get_historical_data',
  description: '拉取历史 K 线',
  inputSchema: {
    type: 'object',
    properties: {
      symbol: { type: 'string' },
      interval: { type: 'string' },
      limit: { type: 'number' },
    },
    required: ['symbol', 'interval'],
  },
  execute: async ({ symbol, interval, limit = 100 }) => ({ symbol, interval, limit, klines: [], _mock: true }),
};

export const run_backtest: Tool = {
  name: 'run_backtest',
  description: '回测策略',
  inputSchema: {
    type: 'object',
    properties: {
      strategy: { type: 'string' },
      symbol: { type: 'string' },
      startDate: { type: 'string' },
      endDate: { type: 'string' },
    },
    required: ['strategy', 'symbol', 'startDate', 'endDate'],
  },
  execute: async () => ({ sharpe: 0, maxDrawdown: 0, totalReturn: 0, _mock: true }),
};

export { send_alert };

export const update_config: Tool = {
  name: 'update_config',
  description: '动态更新配置',
  inputSchema: {
    type: 'object',
    properties: {
      key: { type: 'string' },
      value: { any: true },
    },
    required: ['key', 'value'],
  },
  execute: async ({ key, value }) => ({ updated: true, key, value, _mock: true }),
};

// 导出扩展工具
export { calculate_position_size, check_drawdown, calculate_kelly } from './risk_tools';
export { get_orderbook, calculate_slippage } from './orderbook_tools';

// 8 个核心 + 5 个扩展
export const quantTools: Tool[] = [
  get_market_data,
  place_order,
  get_balance,
  get_positions,
  get_historical_data,
  run_backtest,
  send_alert,
  update_config,
  calculate_position_size,
  check_drawdown,
  calculate_kelly,
  get_orderbook,
  calculate_slippage,
];
