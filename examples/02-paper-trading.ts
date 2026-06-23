/**
 * 示例 2: 完整 Paper Trading
 * 不用任何 API key,用 Mock LLM
 */

import { Agent } from '../src/core/agent';
import { LLMRouter } from '../src/llm/router';
import { ToolRegistry } from '../src/tools/registry';
import { quantTools } from '../src/tools/quant';
import { getSystemPrompt } from '../src/llm/prompts';

async function main() {
  console.log('=== Paper Trading (Mock LLM) ===\n');

  // 1. 初始化
  const llm = new LLMRouter({ mock: true });
  console.log(`LLM: ${llm.getAvailableProviders().join(', ')}`);

  const tools = new ToolRegistry();
  for (const tool of quantTools) {
    tools.register(tool);
  }
  console.log(`工具: ${tools.list().length} 个`);

  const agent = new Agent({
    systemPrompt: getSystemPrompt('paper'),
    llm,
    tools,
  });

  // 2. 跑 5 个 tick
  for (let i = 1; i <= 5; i++) {
    console.log(`\n--- Tick ${i} ---`);
    await agent.tick({ tickNumber: i, mode: 'paper' });
    await new Promise(r => setTimeout(r, 1000));  // 1s 模拟 5min
  }

  console.log('\n✅ 完成 5 个 tick');
}

main().catch(console.error);
