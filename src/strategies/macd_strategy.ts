/**
 * MACD 趋势策略
 *
 * 规则:
 *   - MACD 上穿 signal → buy
 *   - MACD 下穿 signal → sell
 *   - 其他 → hold
 */

import { BaseStrategy, StrategyContext, Signal } from './base';
import { macd } from './indicators';

export class MACDTrendStrategy extends BaseStrategy {
  name = 'MACD Trend';
  description = 'MACD 与 signal 交叉';

  onTick(ctx: StrategyContext): Signal {
    const closes = ctx.candles.map(c => c.close);
    const result = macd(closes);

    // MACD 上穿 signal(转正)
    if (result.macd > result.signal && result.histogram > 0 && ctx.position <= 0) {
      return 'buy';
    }
    // MACD 下穿 signal(转负)
    if (result.macd < result.signal && result.histogram < 0 && ctx.position >= 0) {
      return 'sell';
    }
    return 'hold';
  }
}
