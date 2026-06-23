import { describe, it, expect } from 'vitest';
import { LLMBenchmark } from '../src/llm/benchmark';
import { LLMRouter } from '../src/llm/router';

describe('LLMBenchmark', () => {
  it('should run benchmark with mock LLM', async () => {
    const router = new LLMRouter({ mock: true });
    const benchmark = new LLMBenchmark(router);
    const result = await benchmark.runOne({
      name: 'test',
      description: 'test',
      systemPrompt: 'Test system prompt',
      userPrompt: 'BTC/USDT 突破 MA20',
      expectedAction: 'buy',
      expectedSymbol: 'BTC/USDT',
    });

    expect(result.provider).toBe('mock');
    expect(result.isValid).toBe(true);
    expect(result.decision.action).toBe('buy');
  });

  it('should handle parse errors gracefully', async () => {
    const router = new LLMRouter({ mock: true });
    const benchmark = new LLMBenchmark(router);
    const result = await benchmark.runOne({
      name: 'test',
      description: 'test',
      systemPrompt: 'Test',
      userPrompt: 'No signal here',  // 不是 BTC/USDT
      expectedAction: 'buy',
      expectedSymbol: 'BTC/USDT',
    });

    expect(result.isValid).toBe(false);
  });
});
