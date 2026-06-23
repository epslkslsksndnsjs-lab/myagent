/**
 * MA 交叉策略 - 经典入门策略
 *
 * 规则:
 *   - 短期均线上穿长期均线 → buy
 *   - 短期均线下穿长期均线 → sell
 *   - 其他 → hold
 */

import { BaseStrategy, StrategyContext, Signal } from './base';
import { sma } from './indicators';

export class MACrossStrategy extends BaseStrategy {
  name = 'MA Cross';
  description = '短期均线上穿/下穿长期均线';

  onTick(ctx: StrategyContext): Signal {
    const closes = ctx.candles.map(c => c.close);
    const fastPeriod = this.param('fast', 5);
    const slowPeriod = this.param('slow', 20);

    const fastMA = sma(closes, fastPeriod);
    const slowMA = sma(closes, slowPeriod);

    if (fastMA === 0 || slowMA === 0) return 'hold';

    // 当前价格在均线上方 + 短期 > 长期 → 多头信号
    if (fastMA > slowMA && ctx.position <= 0) {
      return 'buy';
    }

    // 短期 < 长期 → 空头信号
    if (fastMA < slowMA && ctx.position >= 0) {
      return 'sell';
    }

    return 'hold';
  }
}
