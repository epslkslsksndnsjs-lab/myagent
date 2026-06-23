import { describe, it, expect } from 'vitest';
import { LLMRouter } from '../src/llm/router';
import { MockLLM } from '../src/llm/mock';

describe('LLMRouter', () => {
  it('should use mock when no API key configured', async () => {
    const router = new LLMRouter({ mock: true });
    const response = await router.chat({
      messages: [
        { role: 'user', content: 'Test BTC/USDT breakout' },
      ],
    });
    expect(response.provider).toBe('mock');
    expect(response.content).toContain('BTC/USDT');
  });

  it('should return available providers', () => {
    const router = new LLMRouter({ mock: true });
    expect(router.getAvailableProviders()).toContain('mock');
  });

  it('should fall back to mock on error', async () => {
    const router = new LLMRouter({});  // no providers
    // 不显式设置 mock,应该走 mock fallback
    const response = await router.chat({
      messages: [
        { role: 'user', content: 'Test' },
      ],
    });
    expect(response.provider).toBe('mock');
  });
});

describe('MockLLM', () => {
  it('should return buy on breakout', async () => {
    const mock = new MockLLM();
    const response = await mock.chat({
      messages: [
        { role: 'user', content: 'BTC/USDT 突破 MA20' },
      ],
    });
    const decision = JSON.parse(response.content);
    expect(decision.action).toBe('buy');
  });

  it('should return hold on no signal', async () => {
    const mock = new MockLLM();
    const response = await mock.chat({
      messages: [
        { role: 'user', content: 'No signal here' },
      ],
    });
    const decision = JSON.parse(response.content);
    expect(decision.action).toBe('hold');
  });
});
