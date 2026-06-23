/**
 * 性能指标 - 单独的工具
 * 借鉴 quantstats 思路,简化
 */

export interface PerformanceMetrics {
  totalReturn: number;       // 总收益(%)
  annualizedReturn: number;  // 年化收益(%)
  sharpeRatio: number;       // 夏普比率
  sortinoRatio: number;      // 索提诺比率(只算下行波动)
  maxDrawdown: number;       // 最大回撤(%)
  maxDrawdownDuration: number; // 回撤持续时间(天)
  winRate: number;           // 胜率(%)
  profitFactor: number;      // 盈亏比
  calmarRatio: number;        // 卡玛比率(年化收益/最大回撤)
  volatility: number;         // 波动率(%)
  skewness: number;           // 偏度
  kurtosis: number;           // 峰度
}

export function calculateMetrics(equityCurve: number[]): PerformanceMetrics {
  if (equityCurve.length < 2) {
    return {
      totalReturn: 0, annualizedReturn: 0, sharpeRatio: 0, sortinoRatio: 0,
      maxDrawdown: 0, maxDrawdownDuration: 0, winRate: 0, profitFactor: 0,
      calmarRatio: 0, volatility: 0, skewness: 0, kurtosis: 0,
    };
  }

  // 收益
  const totalReturn = (equityCurve[equityCurve.length - 1] - equityCurve[0]) / equityCurve[0];
  const days = equityCurve.length / (24 * 60 / 5);  // 假设 5min bars
  const annualizedReturn = days > 0
    ? Math.pow(1 + totalReturn, 365 / days) - 1
    : 0;

  // 收益序列
  const returns: number[] = [];
  for (let i = 1; i < equityCurve.length; i++) {
    returns.push((equityCurve[i] - equityCurve[i - 1]) / equityCurve[i - 1]);
  }

  // 平均收益 + 波动率
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + (r - avgReturn) ** 2, 0) / returns.length;
  const stdReturn = Math.sqrt(variance);
  const volatility = stdReturn * Math.sqrt(365 * 24 * 60 / 5);

  // 夏普比率
  const sharpeRatio = stdReturn > 0
    ? (avgReturn / stdReturn) * Math.sqrt(365 * 24 * 60 / 5)
    : 0;

  // 索提诺比率(只算下行)
  const downsideReturns = returns.filter(r => r < 0);
  const downsideStd = downsideReturns.length > 0
    ? Math.sqrt(downsideReturns.reduce((sum, r) => sum + r ** 2, 0) / downsideReturns.length)
    : 0;
  const sortinoRatio = downsideStd > 0
    ? (avgReturn / downsideStd) * Math.sqrt(365 * 24 * 60 / 5)
    : 0;

  // 最大回撤
  let peak = equityCurve[0];
  let maxDD = 0;
  let maxDDDuration = 0;
  let currentDDDuration = 0;

  for (const equity of equityCurve) {
    if (equity > peak) {
      peak = equity;
      currentDDDuration = 0;
    } else {
      currentDDDuration++;
      const dd = (peak - equity) / peak;
      if (dd > maxDD) maxDD = dd;
      if (currentDDDuration > maxDDDuration) maxDDDuration = currentDDDuration;
    }
  }

  // 胜率(连续收益 > 0 比例)
  const wins = returns.filter(r => r > 0);
  const winRate = wins.length / returns.length;

  // 盈亏比
  const avgWin = wins.length > 0 ? wins.reduce((a, b) => a + b, 0) / wins.length : 0;
  const losses = returns.filter(r => r < 0);
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((a, b) => a + b, 0) / losses.length) : 0;
  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;

  // 卡玛比率
  const calmarRatio = maxDD > 0 ? annualizedReturn / maxDD : 0;

  // 偏度 + 峰度
  const skewness = stdReturn > 0
    ? returns.reduce((sum, r) => sum + Math.pow((r - avgReturn) / stdReturn, 3), 0) / returns.length
    : 0;
  const kurtosis = stdReturn > 0
    ? returns.reduce((sum, r) => sum + Math.pow((r - avgReturn) / stdReturn, 4), 0) / returns.length - 3
    : 0;

  return {
    totalReturn: totalReturn * 100,
    annualizedReturn: annualizedReturn * 100,
    sharpeRatio,
    sortinoRatio,
    maxDrawdown: maxDD * 100,
    maxDrawdownDuration: maxDDDuration / (24 * 60 / 5),  // 转为天
    winRate: winRate * 100,
    profitFactor,
    calmarRatio,
    volatility: volatility * 100,
    skewness,
    kurtosis,
  };
}
