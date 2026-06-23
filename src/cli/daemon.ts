/**
 * Daemon 启动 - 7×24 模式
 * 集成 Metrics + Health + Agent
 */

import { LLMRouter } from '../llm/router';
import { ToolRegistry } from '../tools/registry';
import { quantTools } from '../tools/quant';
import { getSystemPrompt } from '../llm/prompts';
import { ConfigLoader } from '../config/loader';
import { Agent } from '../core/agent';
import { Metrics, MyMetrics } from '../observability/metrics';
import { HealthCheck } from '../observability/health';
import { MetricsServer } from '../server/metrics_server';
import { saveState } from '../core/state';
import { logger } from '../utils/logger';

export class Daemon {
  private metrics = new Metrics();
  private health = new HealthCheck();
  private metricsServer: MetricsServer | null = null;

  async start(): Promise<void> {
    console.log('🤖 myagent daemon 启动中...\n');

    // 1. 加载配置
    const config = await ConfigLoader.load();
    console.log(`  模式: ${config.mode}`);
    console.log(`  Tick: ${config.tickInterval}s`);
    console.log(`  标的: ${config.symbols.join(', ')}`);
    console.log(`  策略: ${config.strategy.name}`);

    // 2. 注册健康检查
    this.health.register('config', async () => ({
      status: 'ok',
      message: 'Config loaded',
      lastCheck: Date.now(),
    }));
    this.health.register('llm', async () => ({
      status: 'ok',
      message: 'LLM router ready',
      lastCheck: Date.now(),
    }));

    // 3. 初始化组件
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

    // 4. 启动 metrics server
    this.metricsServer = new MetricsServer(this.metrics, this.health, 9090);
    await this.metricsServer.start();

    // 5. 主循环
    let running = true;
    let tick = 0;

    process.on('SIGINT', () => { running = false; });
    process.on('SIGTERM', () => { running = false; });

    console.log('\n  7×24 daemon 运行中...');
    console.log('  Metrics: http://localhost:9090/metrics');
    console.log('  Health: http://localhost:9090/health');
    console.log('  按 Ctrl+C 退出\n');

    while (running) {
      tick++;
      const start = Date.now();
      MyMetrics.tickTotal();

      try {
        await agent.tick({ tickNumber: tick, mode: config.mode });
        const duration = Date.now() - start;
        MyMetrics.observeTickDuration(duration);
        console.log(`  [${new Date().toISOString()}] tick ${tick} ✓ (${duration}ms)`);
      } catch (e) {
        MyMetrics.errorTotal('tick');
        console.error(`  [ERROR] tick ${tick}:`, e);
      }

      // 状态持久化(每 10 tick)
      if (tick % 10 === 0) {
        try {
          await saveState({ lastTick: tick, positions: [], pnl: 0 });
        } catch (e) {
          logger.error('Save state failed:', e);
        }
      }

      await new Promise(r => setTimeout(r, config.tickInterval * 1000));
    }

    // 清理
    this.metricsServer?.stop();
    console.log('\n  Daemon 退出');
  }
}
