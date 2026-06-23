/**
 * 本地 Mock LLM - 规则引擎实现
 *
 * 用途:
 *   - 跑通完整流程(无需 API key)
 *   - 离线测试
 *   - 演示
 *
 * 借鉴 vnpy 的"策略模板"思路,简化
 */

import { logger } from '../utils/logger';
import type { ChatRequest, ChatResponse } from './router';

export class MockLLM {
  /**
   * 模拟 LLM 响应
   * - 接收 prompt
   * - 返回结构化 JSON 决策
   */
  async chat(req: ChatRequest): Promise<ChatResponse> {
    logger.debug('MockLLM: simulating response');

    // 简单规则:看 prompt 内容,返回 hold 或 buy
    const lastMessage = req.messages[req.messages.length - 1]?.content || '';

    let decision = {
      action: 'hold',
      symbol: 'BTC/USDT',
      amount: 0,
      reasoning: 'Mock LLM: default hold (insufficient data)',
    };

    if (lastMessage.includes('BTC/USDT')) {
      // 简单规则:如果有"突破"则 buy
      if (lastMessage.includes('突破') || lastMessage.includes('breakout')) {
        decision = {
          action: 'buy',
          symbol: 'BTC/USDT',
          amount: 0.05,
          reasoning: 'Mock LLM: detected breakout signal',
        };
      } else if (lastMessage.includes('超买') || lastMessage.includes('overbought')) {
        decision = {
          action: 'sell',
          symbol: 'BTC/USDT',
          amount: 0.05,
          reasoning: 'Mock LLM: detected overbought signal',
        };
      }
    }

    return {
      content: JSON.stringify(decision, null, 2),
      provider: 'mock',
      model: 'mock-v1',
      usage: {
        inputTokens: 100,
        outputTokens: 50,
      },
    };
  }
}
