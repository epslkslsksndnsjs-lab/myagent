/**
 * 风控工具(扩展)
 * - calculate_position_size: 根据风险算仓位
 * - check_drawdown: 检查回撤
 * - calculate_kelly: Kelly 公式
 */

import type { Tool } from '../registry';

export const calculate_position_size: Tool = {
  name: 'calculate_position_size',
  description: '根据账户余额和风险参数计算仓位大小',
  inputSchema: {
    type: 'object',
    properties: {
      accountBalance: { type: 'number', description: '账户余额 USD' },
      riskPercent: { type: 'number', description: '单笔风险比例,默认 0.5%' },
      entryPrice: { type: 'number', description: '入场价' },
      stopLoss: { type: 'number', description: '止损价' },
    },
    required: ['accountBalance', 'entryPrice', 'stopLoss'],
  },
  execute: async ({ accountBalance, riskPercent = 0.005, entryPrice, stopLoss }) => {
    const riskAmount = accountBalance * riskPercent;
    const priceRisk = Math.abs(entryPrice - stopLoss);
    const positionSize = priceRisk > 0 ? riskAmount / priceRisk : 0;
    const positionValue = positionSize * entryPrice;
    const leverage = positionValue / accountBalance;

    return {
      riskAmount,
      positionSize,
      positionValue,
      leverage,
      riskPercent: riskPercent * 100,
    };
  },
};

export const check_drawdown: Tool = {
  name: 'check_drawdown',
  description: '检查当前回撤是否超过阈值',
  inputSchema: {
    type: 'object',
    properties: {
      peakEquity: { type: 'number', description: '峰值权益' },
      currentEquity: { type: 'number', description: '当前权益' },
      maxDrawdownPercent: { type: 'number', description: '最大允许回撤,默认 15%' },
    },
    required: ['peakEquity', 'currentEquity'],
  },
  execute: async ({ peakEquity, currentEquity, maxDrawdownPercent = 0.15 }) => {
    const drawdown = (peakEquity - currentEquity) / peakEquity;
    return {
      drawdown: drawdown * 100,
      drawdownAmount: peakEquity - currentEquity,
      maxAllowed: maxDrawdownPercent * 100,
      shouldStop: drawdown >= maxDrawdownPercent,
      shouldReduce: drawdown >= maxDrawdownPercent / 2,
    };
  },
};

export const calculate_kelly: Tool = {
  name: 'calculate_kelly',
  description: 'Kelly 公式计算最优仓位比例',
  inputSchema: {
    type: 'object',
    properties: {
      winRate: { type: 'number', description: '胜率 0-1' },
      avgWin: { type: 'number', description: '平均盈利' },
      avgLoss: { type: 'number', description: '平均亏损' },
    },
    required: ['winRate', 'avgWin', 'avgLoss'],
  },
  execute: async ({ winRate, avgWin, avgLoss }) => {
    if (avgLoss === 0) return { kelly: 0, fractionalKelly: 0 };
    const ratio = avgWin / avgLoss;
    const kelly = winRate - (1 - winRate) / ratio;
    // 用半 Kelly(更保守)
    const fractionalKelly = kelly / 2;
    return {
      kelly: Math.max(0, kelly * 100),
      fractionalKelly: Math.max(0, fractionalKelly * 100),
    };
  },
};
