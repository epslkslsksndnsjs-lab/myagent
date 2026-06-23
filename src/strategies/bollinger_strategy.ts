/**
 * Bollinger Bands 突破策略
 *
 * 规则:
 *   - 价格突破下轨 → buy(超卖反弹)
 *   - 价格突破上轨 → sell(超买回调)
 *   - 其他 → hold
 */

import { BaseStrategy, StrategyContext, Signal } from './base';
import { bollinger } from './indicators';

export class BollingerStrategy extends BaseStrategy {
  name = 'Bollinger Bands';
  description = '突破布林带';

  onTick(ctx: StrategyContext): Signal {
    const closes = ctx.candles.map(c => c.close);
    const period = this.param('period', 20);
    const stdDev = this.param('stdDev', 2);
    const bands = bollinger(closes, period, stdDev);

    const lastPrice = closes[closes.length - 1];

    if (lastPrice <= bands.lower && ctx.position <= 0) {
      return 'buy';
    }
    if (lastPrice >= bands.upper && ctx.position >= 0) {
      return 'sell';
    }
    return 'hold';
  }
}
