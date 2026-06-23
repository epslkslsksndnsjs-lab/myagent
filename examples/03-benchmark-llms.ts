/**
 * 示例 3: 对比不同 LLM 的 quant 决策质量
 */

import { LLMRouter } from '../src/llm/router';
import { LLMBenchmark } from '../src/llm/benchmark';

async function main() {
  console.log('=== LLM Benchmark ===\n');

  // 配置多 LLM(没填的会自动跳过)
  const router = new LLMRouter({
    mock: true,
    anthropic: process.env.ANTHROPIC_API_KEY,
    deepseek: process.env.DEEPSEEK_API_KEY,
  });

  console.log('可用 providers:', router.getAvailableProviders().join(', '));

  const benchmark = new LLMBenchmark(router);
  const results = await benchmark.runAll();

  console.log('\n=== 结果 ===');
  for (const r of results) {
    console.log(`\nProvider: ${r.provider} (${r.model})`);
    console.log(`  延迟: ${r.latencyMs}ms`);
    console.log(`  Tokens: ${r.inputTokens} in / ${r.outputTokens} out`);
    console.log(`  成本: $${r.estimatedCost.toFixed(6)}`);
    console.log(`  决策:`, r.decision);
    console.log(`  有效: ${r.isValid ? '✅' : '❌'}`);
    if (r.errors.length) console.log(`  错误: ${r.errors.join(', ')}`);
  }
}

main().catch(console.error);
