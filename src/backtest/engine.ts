/**
 * 回测引擎 - 借鉴 vnpy CtaBacktester 思路,简化版
 *
 * 工作流:
 *   1. 加载历史 K 线(从 Binance/CoinGecko API)
 *   2. 跑策略(每根 K 线 onTick)
 *   3. 模拟下单(考虑手续费、滑点)
 *   4. 计算指标(夏普、最大回撤、总收益)
 *
 * 借鉴但完全自写:
 *   - vnpy CtaBacktester (复杂,本项目简化)
 *   - backtrader (Python,本项目 TypeScript)
 *   - lean (Python,本项目 TypeScript)
 */

import { BaseStrategy, Signal, StrategyContext } from '../strategies/base';
import { Candle } from '../strategies/indicators';

export interface BacktestConfig {
  symbol: string;
  startDate: string;   // YYYY-MM-DD
  endDate: string;
  initialCapital: number;
  commission: number;   // 0.001 = 0.1%
  slippage: number;     // 0.0005 = 0.05%
  interval: string;     // '5m' | '1h' | '1d'
}

export interface BacktestTrade {
  timestamp: number;
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  pnl: number;
  commission: number;
}

export interface BacktestResult {
  config: BacktestConfig;
  totalReturn: number;        // 总收益(%)
  annualizedReturn: number;   // 年化收益(%)
  sharpeRatio: number;        // 夏普比率
  maxDrawdown: number;        // 最大回撤(%)
  winRate: number;            // 胜率
  totalTrades: number;        // 总交易数
  winningTrades: number;      // 盈利交易
  losingTrades: number;       // 亏损交易
  avgWin: number;             // 平均盈利
  avgLoss: number;            // 平均亏损
  profitFactor: number;       // 盈亏比
  finalEquity: number;        // 最终资金
  trades: BacktestTrade[];    // 所有交易
  equityCurve: { timestamp: number; equity: number }[];
}

export class BacktestEngine {
  private config: BacktestConfig;
  private strategy: BaseStrategy;

  constructor(config: BacktestConfig, strategy: BaseStrategy) {
    this.config = config;
    this.strategy = strategy;
  }

  /**
   * 跑回测
   * @param candles 历史 K 线
   */
  async run(candles: Candle[]): Promise<BacktestResult> {
    if (candles.length === 0) {
      throw new Error('No candles provided');
    }

    // 状态
    let cash = this.config.initialCapital;
    let position = 0;
    let entryPrice = 0;
    const trades: BacktestTrade[] = [];
    const equityCurve: { timestamp: number; equity: number }[] = [];
    let peakEquity = cash;
    let maxDrawdown = 0;

    // 滑窗:策略需要历史数据
    const lookback = 50;

    for (let i = lookback; i < candles.length; i++) {
      const window = candles.slice(0, i + 1);
      const currentCandle = candles[i];

      // 构造策略上下文
      const ctx: StrategyContext = {
        symbol: this.config.symbol,
        candles: window,
        position,
        cash,
      };

      // 策略决策
      const signal = this.strategy.onTick(ctx);

      // 执行
      if (signal === 'buy' && position <= 0) {
        // 买入:用可用现金的 95%(留 5% buffer)
        const buyAmount = (cash * 0.95) / currentCandle.close;
        if (buyAmount > 0) {
          const slippagePrice = currentCandle.close * (1 + this.config.slippage);
          const cost = buyAmount * slippagePrice;
          const commission = cost * this.config.commission;

          cash -= cost + commission;
          position = buyAmount;
          entryPrice = slippagePrice;

          trades.push({
            timestamp: currentCandle.timestamp,
            symbol: this.config.symbol,
            side: 'buy',
            price: slippagePrice,
            amount: buyAmount,
            pnl: 0,
            commission,
          });
        }
      } else if (signal === 'sell' && position > 0) {
        // 卖出
        const slippagePrice = currentCandle.close * (1 - this.config.slippage);
        const proceeds = position * slippagePrice;
        const commission = proceeds * this.config.commission;
        const pnl = position * (slippagePrice - entryPrice) - commission;

        cash += proceeds - commission;
        trades.push({
          timestamp: currentCandle.timestamp,
          symbol: this.config.symbol,
          side: 'sell',
          price: slippagePrice,
          amount: position,
          pnl,
          commission,
        });

        position = 0;
        entryPrice = 0;
      }

      // 计算当前 equity
      const equity = cash + position * currentCandle.close;
      equityCurve.push({ timestamp: currentCandle.timestamp, equity });

      // 跟踪最大回撤
      if (equity > peakEquity) peakEquity = equity;
      const drawdown = (peakEquity - equity) / peakEquity;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }

    // 最终平仓
    if (position > 0) {
      const lastCandle = candles[candles.length - 1];
      const slippagePrice = lastCandle.close * (1 - this.config.slippage);
      const proceeds = position * slippagePrice;
      const commission = proceeds * this.config.commission;
      const pnl = position * (slippagePrice - entryPrice) - commission;
      cash += proceeds - commission;
      position = 0;
    }

    // 计算指标
    const finalEquity = cash;
    const totalReturn = (finalEquity - this.config.initialCapital) / this.config.initialCapital;

    // 年化收益
    const days = (candles[candles.length - 1].timestamp - candles[0].timestamp) / (1000 * 60 * 60 * 24);
    const annualizedReturn = days > 0
      ? (Math.pow(1 + totalReturn, 365 / days) - 1)
      : 0;

    // 夏普比率(简化,假设无风险利率 0)
    const returns = equityCurve.map((e, i) =>
      i === 0 ? 0 : (e.equity - equityCurve[i - 1].equity) / equityCurve[i - 1].equity
    );
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const stdReturn = Math.sqrt(
      returns.reduce((sum, r) => sum + (r - avgReturn) ** 2, 0) / returns.length
    );
    const sharpeRatio = stdReturn > 0
      ? (avgReturn / stdReturn) * Math.sqrt(365 * 24 * 60 / 5)  // 5min bars
      : 0;

    // 胜率 + 盈亏比
    const winningTrades = trades.filter(t => t.side === 'sell' && t.pnl > 0);
    const losingTrades = trades.filter(t => t.side === 'sell' && t.pnl < 0);
    const closedTrades = winningTrades.length + losingTrades.length;
    const winRate = closedTrades > 0 ? winningTrades.length / closedTrades : 0;
    const avgWin = winningTrades.length > 0
      ? winningTrades.reduce((s, t) => s + t.pnl, 0) / winningTrades.length
      : 0;
    const avgLoss = losingTrades.length > 0
      ? Math.abs(losingTrades.reduce((s, t) => s + t.pnl, 0) / losingTrades.length)
      : 0;
    const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;

    return {
      config: this.config,
      totalReturn: totalReturn * 100,
      annualizedReturn: annualizedReturn * 100,
      sharpeRatio,
      maxDrawdown: maxDrawdown * 100,
      winRate: winRate * 100,
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      avgWin,
      avgLoss,
      profitFactor,
      finalEquity,
      trades,
      equityCurve,
    };
  }
}
