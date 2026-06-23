/**
 * 策略基类 - 借鉴 vnpy CtaTemplate 思路
 *
 * 每个策略:
 *   - on_tick(candle): 收到新 K 线
 *   - generate_signal(): 生成交易信号
 *   - 内部状态
 */

import { Candle } from './indicators';

export type Signal = 'buy' | 'sell' | 'hold';

export interface StrategyContext {
  symbol: string;
  candles: Candle[];
  position: number;  // 当前持仓(正数多,负数空)
  cash: number;       // 可用现金
}

export abstract class BaseStrategy {
  abstract name: string;
  abstract description: string;
  protected params: Record<string, any>;

  constructor(params: Record<string, any> = {}) {
    this.params = params;
  }

  abstract onTick(ctx: StrategyContext): Signal;

  protected param(key: string, defaultValue: any): any {
    return this.params[key] ?? defaultValue;
  }
}
