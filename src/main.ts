/**
 * myagent - AI quant trading agent 入口
 *
 * 架构借鉴 Claude Code 2.1.88(已泄露源码),但完全重写
 * 借鉴思路:
 *   - Agent loop(用户输入 → 思考 → 调工具 → 输出)
 *   - Context management(token 计数 + 压缩)
 *   - Tool registry(动态加载)
 *
 * 差异(自有):
 *   - Tick-driven 而非 REPL
 *   - 多 LLM 路由(Claude/OpenAI/DeepSeek/Qwen)
 *   - 8 个 quant 工具(不是编码工具)
 *   - 7×24 自动运行
 *
 * 7×24 模式:
 *   - tickInterval(默认 5min)触发
 *   - 拉行情 → 算指标 → AI 决策 → 风控 → 下单
 *   - 状态持久化(重启恢复)
 *   - 异常告警(钉钉/微信)
 */

import { Agent } from './core/agent';
import { LLMRouter } from './llm/router';
import { ToolRegistry } from './tools/registry';
import { quantTools } from './tools/quant';
import { getSystemPrompt } from './llm/prompts';
import { loadState, saveState } from './core/state';
import { sendAlert } from './tools/quant/send_alert';
import { logger } from './utils/logger';

const TICK_INTERVAL = parseInt(process.env.TICK_INTERVAL || '300') * 1000; // 默认 5 分钟
const QUANT_MODE = process.env.QUANT_MODE || 'paper'; // paper | live

async function main() {
  logger.info('========================================');
  logger.info('  myagent v0.1.0-alpha.1');
  logger.info('  AI-powered quant trading agent');
  logger.info(`  Mode: ${QUANT_MODE}`);
  logger.info(`  Tick interval: ${TICK_INTERVAL / 1000}s`);
  logger.info('========================================');

  // 1. 加载状态(崩溃恢复)
  const state = await loadState();
  logger.info(`State loaded: tick=${state.lastTick}, positions=${state.positions.length}`);

  // 2. 初始化 LLM 路由
  const llmRouter = new LLMRouter({
    anthropic: process.env.ANTHROPIC_API_KEY,
    openai: process.env.OPENAI_API_KEY,
    deepseek: process.env.DEEPSEEK_API_KEY,
    qwen: process.env.QWEN_API_KEY,
  });
  logger.info(`LLM Router initialized, available: ${llmRouter.getAvailableProviders().join(', ')}`);

  // 3. 初始化工具注册器
  const toolRegistry = new ToolRegistry();
  for (const tool of quantTools) {
    toolRegistry.register(tool);
  }
  logger.info(`Tools registered: ${toolRegistry.list().join(', ')}`);

  // 4. 初始化 Agent
  const agent = new Agent({
    systemPrompt: getSystemPrompt(QUANT_MODE),
    llm: llmRouter,
    tools: toolRegistry,
  });

  // 5. 主循环 - 7×24 tick
  let tickCount = state.lastTick || 0;
  let running = true;

  // 优雅退出
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    running = false;
    await saveState({ lastTick: tickCount, positions: state.positions, pnl: state.pnl });
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully...');
    running = false;
    await saveState({ lastTick: tickCount, positions: state.positions, pnl: state.pnl });
    process.exit(0);
  });

  // 启动告警
  await sendAlert({
    level: 'info',
    msg: `myagent started, mode=${QUANT_MODE}, tick=${TICK_INTERVAL / 1000}s`,
  });

  logger.info('Entering main loop...');

  while (running) {
    try {
      tickCount++;
      logger.info(`--- Tick ${tickCount} ---`);

      // 6. 每 tick 工作流
      await agent.tick({
        tickNumber: tickCount,
        mode: QUANT_MODE,
      });

      // 7. 状态持久化(每 10 tick)
      if (tickCount % 10 === 0) {
        await saveState({ lastTick: tickCount, positions: state.positions, pnl: state.pnl });
        logger.debug('State saved');
      }
    } catch (error) {
      logger.error('Tick failed:', error);
      await sendAlert({
        level: 'error',
        msg: `Tick ${tickCount} failed: ${error instanceof Error ? error.message : String(error)}`,
      });
    }

    // 8. 等待下一个 tick
    await sleep(TICK_INTERVAL);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 启动
main().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});
