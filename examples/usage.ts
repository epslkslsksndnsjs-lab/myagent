/**
 * myagent 使用示例
 */

import { Agent } from '../src/core/agent';
import { LLMRouter } from '../src/llm/router';
import { ToolRegistry } from '../src/tools/registry';
import { quantTools } from '../src/tools/quant';
import { getSystemPrompt } from '../src/llm/prompts';

async function main() {
  // 1. 初始化 LLM
  const llm = new LLMRouter({
    anthropic: process.env.ANTHROPIC_API_KEY,
  });

  // 2. 初始化工具
  const tools = new ToolRegistry();
  for (const tool of quantTools) {
    tools.register(tool);
  }

  // 3. 初始化 Agent
  const agent = new Agent({
    systemPrompt: getSystemPrompt('paper'),
    llm,
    tools,
  });

  // 4. 跑 1 个 tick
  await agent.tick({
    tickNumber: 1,
    mode: 'paper',
  });
}

main().catch(console.error);
