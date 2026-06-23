/**
 * 8 个 AI quant 工具 - 核心差异化(自有)
 *
 * 与传统 quant 工具(vnpy 等)的区别:
 * - AI 友好(input/output 简洁,LLM 易调用)
 * - 标准化(8 个工具覆盖 90% quant 场景)
 * - 集成 LLM(每个工具都有"AI 解释")
 */

import { Tool } from '../registry';

// 1. 实时行情
export const get_market_data: Tool = {
  name: 'get_market_data',
  description: '获取多个交易对的实时行情(价格、24h 涨跌、成交量)',
  inputSchema: {
    type: 'object',
    properties: {
      symbols: { type: 'array', items: { type: 'string' }, description: '交易对列表,如 ["BTC/USDT", "ETH/USDT"]' },
    },
    required: ['symbols'],
  },
  execute: async ({ symbols }) => {
    // TODO: 接入 TradingView MCP / 交易所 API
    // v0.1: 返回 mock 数据
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
  description: '在交易所下单(现货/合约)',
  inputSchema: {
    type: 'object',
    properties: {
      symbol: { type: 'string', description: '交易对,如 BTC/USDT' },
      side: { type: 'string', enum: ['buy', 'sell'], description: '方向' },
      amount: { type: 'number', description: '数量' },
      type: { type: 'string', enum: ['market', 'limit'], description: '订单类型' },
      price: { type: 'number', description: '限价(仅 limit 单需要)' },
    },
    required: ['symbol', 'side', 'amount', 'type'],
  },
  execute: async (input) => {
    // TODO: 接入 OKX / Binance API
    // v0.1: 返回 mock
    return {
      orderId: `mock-${Date.now()}`,
      status: 'filled',
      ...input,
      _mock: true,
    };
  },
};

// 3. 查账户余额
export const get_balance: Tool = {
  name: 'get_balance',
  description: '查询账户余额(总资产、可用、持仓)',
  inputSchema: { type: 'object', properties: {} },
  execute: async () => {
    // TODO: 接入交易所 API
    return {
      total: 10000,
      available: 5000,
      inPositions: 5000,
      _mock: true,
    };
  },
};

// 4. 查持仓
export const get_positions: Tool = {
  name: 'get_positions',
  description: '查询当前所有持仓',
  inputSchema: { type: 'object', properties: {} },
  execute: async () => {
    // TODO: 接入交易所 API
    return { positions: [], _mock: true };
  },
};

// 5. 拉历史 K 线
export const get_historical_data: Tool = {
  name: 'get_historical_data',
  description: '拉取历史 K 线数据(OHLCV)',
  inputSchema: {
    type: 'object',
    properties: {
      symbol: { type: 'string', description: '交易对' },
      interval: { type: 'string', enum: ['1m', '5m', '15m', '1h', '4h', '1d'], description: 'K 线周期' },
      limit: { type: 'number', description: '根数,默认 100' },
    },
    required: ['symbol', 'interval'],
  },
  execute: async ({ symbol, interval, limit = 100 }) => {
    // TODO: 接入 Binance/OKX API
    return { symbol, interval, limit, klines: [], _mock: true };
  },
};

// 6. 回测
export const run_backtest: Tool = {
  name: 'run_backtest',
  description: '对策略进行历史回测,返回夏普、最大回撤、总收益等指标',
  inputSchema: {
    type: 'object',
    properties: {
      strategy: { type: 'string', description: '策略名称或代码' },
      symbol: { type: 'string', description: '交易对' },
      startDate: { type: 'string', description: '开始日期 YYYY-MM-DD' },
      endDate: { type: 'string', description: '结束日期 YYYY-MM-DD' },
      initialCapital: { type: 'number', description: '初始资金' },
    },
    required: ['strategy', 'symbol', 'startDate', 'endDate'],
  },
  execute: async (input) => {
    // TODO: 实现回测引擎
    return {
      sharpe: 0,
      maxDrawdown: 0,
      totalReturn: 0,
      trades: 0,
      _mock: true,
    };
  },
};

// 7. 发告警
export const send_alert: Tool = {
  name: 'send_alert',
  description: '发送告警(钉钉/微信/Telegram)',
  inputSchema: {
    type: 'object',
    properties: {
      level: { type: 'string', enum: ['info', 'warning', 'error', 'critical'], description: '告警级别' },
      msg: { type: 'string', description: '告警内容' },
    },
    required: ['level', 'msg'],
  },
  execute: async ({ level, msg }) => {
    // TODO: 接入钉钉/微信 webhook
    console.log(`[ALERT ${level.toUpperCase()}] ${msg}`);
    return { sent: true, _mock: true };
  },
};

// 8. 改配置
export const update_config: Tool = {
  name: 'update_config',
  description: '动态更新配置(风险参数、策略参数等)',
  inputSchema: {
    type: 'object',
    properties: {
      key: { type: 'string', description: '配置 key' },
      value: { type: 'any', description: '配置 value' },
    },
    required: ['key', 'value'],
  },
  execute: async ({ key, value }) => {
    // TODO: 实现配置持久化
    return { updated: true, key, value, _mock: true };
  },
};

export const quantTools: Tool[] = [
  get_market_data,
  place_order,
  get_balance,
  get_positions,
  get_historical_data,
  run_backtest,
  send_alert,
  update_config,
];
