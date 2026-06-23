/**
 * CLI 命令 - 借鉴 commander 思路,简化
 *
 * 子命令:
 *   - start: 启动 daemon
 *   - status: 看 system
 *   - backtest: 跑回测
 *   - paper: 跑 paper trading
 *   - config: 配置管理
 */

import { logger } from '../utils/logger';
import { ConfigLoader } from '../config/loader';
import { BacktestEngine } from '../backtest/engine';
import { MACrossStrategy } from '../strategies/ma_cross';
import { RSIStrategy } from '../strategies/rsi_strategy';
import { CoinGeckoClient } from '../data/coingecko';
import { Metrics } from '../observability/metrics';
import { HealthCheck } from '../observability/health';
import { LLMRouter } from '../llm/router';
import { Agent } from '../core/agent';
import { ToolRegistry } from '../tools/registry';
import { quantTools } from '../tools/quant';
import { getSystemPrompt } from '../llm/prompts';
import { loadState } from '../core/state';
import type { Candle } from '../strategies/indicators';

export class CLI {
  /**
   * start - 启动 daemon
   */
  static async start(): Promise<void> {
    console.log('🤖 myagent daemon 启动中...');
    const config = await ConfigLoader.load();
    console.log(`  模式: ${config.mode}`);
    console.log(`  Tick: ${config.tickInterval}s`);
    console.log(`  标的: ${config.symbols.join(', ')}`);
    console.log(`  策略: ${config.strategy.name}`);

    // 初始化组件
    const llm = new LLMRouter({
      mock: config.llm.provider === 'mock',
      anthropic: process.env.ANTHROPIC_API_KEY,
      openai: process.env.OPENAI_API_KEY,
      deepseek: process.env.DEEPSEEK_API_KEY,
      qwen: process.env.QWEN_API_KEY,
    });

    const tools = new ToolRegistry();
    for (const tool of quantTools) tools.register(tool);

    const agent = new Agent({
      systemPrompt: getSystemPrompt(config.mode),
      llm,
      tools,
    });

    console.log('\n  按 Ctrl+C 退出');
    console.log('');

    // 主循环
    let running = true;
    let tick = 0;
    process.on('SIGINT', () => { running = false; });
    process.on('SIGTERM', () => { running = false; });

    while (running) {
      tick++;
      const start = Date.now();
      try {
        await agent.tick({ tickNumber: tick, mode: config.mode });
        const duration = Date.now() - start;
        console.log(`  [${new Date().toISOString()}] tick ${tick} 完成(${duration}ms)`);
      } catch (e) {
        console.error(`  [ERROR] tick ${tick}:`, e);
      }
      await new Promise(r => setTimeout(r, config.tickInterval * 1000));
    }

    console.log('\n  Daemon 退出');
  }

  /**
   * status - 看 system
   */
  static async status(): Promise<void> {
    console.log('🤖 myagent status\n');

    const config = await ConfigLoader.load();
    console.log('配置:');
    console.log(`  模式: ${config.mode}`);
    console.log(`  Tick: ${config.tickInterval}s`);
    console.log(`  标的: ${config.symbols.join(', ')}`);
    console.log(`  策略: ${config.strategy.name}`);
    console.log('');

    // 健康检查
    const health = new HealthCheck();
    health.register('config', async () => ({
      status: 'ok',
      message: 'Config loaded',
      lastCheck: Date.now(),
    }));

    const healthStatus = await health.checkAll();
    console.log('健康:');
    for (const [name, c] of Object.entries(healthStatus.checks)) {
      const icon = c.status === 'ok' ? '✅' : c.status === 'degraded' ? '⚠️' : '❌';
      console.log(`  ${icon} ${name}: ${c.status}${c.message ? ' (' + c.message + ')' : ''}`);
    }
    console.log(`  运行时间: ${Math.floor(healthStatus.uptime / 1000)}s`);
    console.log('');

    // 状态数据
    try {
      const state = await loadState();
      console.log('状态:');
      console.log(`  最后 tick: ${state.lastTick}`);
      console.log(`  持仓数: ${state.positions.length}`);
      console.log(`  PnL: $${state.pnl.toFixed(2)}`);
    } catch {
      console.log('System: 未运行(无 state.json)');
    }
  }

  /**
   * backtest - 跑回测
   */
  static async backtest(symbol: string = 'BTC/USDT', days: number = 30): Promise<void> {
    console.log(`📊 myagent backtest: ${symbol} (${days} days)\n`);

    // 拉数据
    const cg = new CoinGeckoClient();
    console.log('  拉取历史数据...');
    const ohlc = await cg.getOHLC('bitcoin', days);
    const candles: Candle[] = ohlc.map(([ts, open, high, low, close]: number[]) => ({
      timestamp: ts,
      open, high, low, close,
      volume: 0,
    }));
    console.log(`  拉到 ${candles.length} 根 K 线`);

    // 跑回测
    const strategies = [
      new MACrossStrategy({ fast: 5, slow: 20 }),
      new RSIStrategy({ period: 14, oversold: 30, overbought: 70 }),
    ];

    for (const strategy of strategies) {
      const engine = new BacktestEngine({
        symbol,
        startDate: new Date(Date.now() - days * 86400_000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        initialCapital: 10000,
        commission: 0.001,
        slippage: 0.0005,
        interval: '1d',
      }, strategy);

      const result = await engine.run(candles);

      console.log(`\n  策略: ${strategy.name}`);
      console.log(`    总收益: ${result.totalReturn.toFixed(2)}%`);
      console.log(`    年化: ${result.annualizedReturn.toFixed(2)}%`);
      console.log(`    夏普: ${result.sharpeRatio.toFixed(2)}`);
      console.log(`    最大回撤: ${result.maxDrawdown.toFixed(2)}%`);
      console.log(`    胜率: ${result.winRate.toFixed(2)}%`);
      console.log(`    交易数: ${result.totalTrades}`);
    }
  }

  /**
   * paper - 跑 paper trading(单次)
   */
  static async paper(): Promise<void> {
    console.log('📄 myagent paper trading (1 tick)\n');

    const llm = new LLMRouter({ mock: true });
    const tools = new ToolRegistry();
    for (const tool of quantTools) tools.register(tool);
    const agent = new Agent({
      systemPrompt: getSystemPrompt('paper'),
      llm,
      tools,
    });

    await agent.tick({ tickNumber: 1, mode: 'paper' });
    console.log('  ✅ 完成');
  }

  /**
   * config - 配置管理
   */
  static async config(action: 'show' | 'init'): Promise<void> {
    if (action === 'show') {
      const config = await ConfigLoader.load();
      console.log(JSON.stringify(config, null, 2));
    } else if (action === 'init') {
      const config = await ConfigLoader.load();
      await ConfigLoader.save(config);
      console.log('  ✅ config.json 已创建');
    }
  }

  /**
   * 帮助
   */
  static help(): void {
    console.log(`
🤖 myagent - AI Quant Trading Agent

用法:
  myagent <command> [options]

命令:
  start              启动 daemon(7×24 模式)
  status             看 system
  backtest [symbol]  跑回测
  paper              跑 1 次 paper trading
  config <action>    配置管理 (show | init)
  help               显示帮助

示例:
  myagent start
  myagent backtest BTC/USDT
  myagent config show

环境变量:
  ANTHROPIC_API_KEY    Claude API key
  OPENAI_API_KEY       OpenAI API key
  DEEPSEEK_API_KEY     DeepSeek API key
  QWEN_API_KEY         Qwen API key
  QUANT_MODE           paper | live
  TICK_INTERVAL        tick 间隔(秒)
`);
  }
}
