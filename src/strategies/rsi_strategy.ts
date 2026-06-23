/**
 * RSI 超买超卖策略
 *
 * 规则:
 *   - RSI < 30 → buy(超卖)
 *   - RSI > 70 → sell(超买)
 *   - 其他 → hold
 */

import { BaseStrategy, StrategyContext, Signal } from './base';
import { rsi } from './indicators';

export class RSIStrategy extends BaseStrategy {
  name = 'RSI Mean Reversion';
  description = 'RSI 超买超卖反转';

  onTick(ctx: StrategyContext): Signal {
    const closes = ctx.candles.map(c => c.close);
    const period = this.param('period', 14);
    const oversold = this.param('oversold', 30);
    const overbought = this.param('overbought', 70);

    const rsiValue = rsi(closes, period);

    if (rsiValue < oversold && ctx.position <= 0) {
      return 'buy';
    }
    if (rsiValue > overbought && ctx.position >= 0) {
      return 'sell';
    }
    return 'hold';
  }
}
