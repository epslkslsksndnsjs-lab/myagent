/**
 * LLM 对比基准 - 给 quant 决策打分
 *
 * 用途:
 *   - 测不同 LLM 的 quant 决策质量
 *   - 对比 mock vs Claude vs GPT
 *   - 找最适合的 LLM
 */

import { LLMRouter, ChatResponse } from './router';
import { logger } from '../utils/logger';

export interface BenchmarkResult {
  provider: string;
  model: string;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  decision: any;
  isValid: boolean;
  errors: string[];
}

export interface BenchmarkScenario {
  name: string;
  description: string;
  systemPrompt: string;
  userPrompt: string;
  expectedAction?: 'buy' | 'sell' | 'hold';
  expectedSymbol?: string;
}

export class LLMBenchmark {
  private router: LLMRouter;
  private scenarios: BenchmarkScenario[];

  constructor(router: LLMRouter) {
    this.router = router;
    this.scenarios = this.defaultScenarios();
  }

  /**
   * 跑所有场景
   */
  async runAll(): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = [];

    for (const scenario of this.scenarios) {
      const result = await this.runOne(scenario);
      results.push(result);
    }

    return results;
  }

  /**
   * 跑单个场景
   */
  async runOne(scenario: BenchmarkScenario): Promise<BenchmarkResult> {
    const providers = this.router.getAvailableProviders();
    const results: BenchmarkResult[] = [];

    // 测所有可用 provider
    for (const provider of providers) {
      const result = await this.testProvider(provider, scenario);
      results.push(result);
    }

    // 返回第一个(实际可以全部返回做对比)
    return results[0] || this.emptyResult();
  }

  /**
   * 测试单个 provider
   */
  private async testProvider(
    provider: string,
    scenario: BenchmarkScenario
  ): Promise<BenchmarkResult> {
    const start = Date.now();
    const errors: string[] = [];

    try {
      const response = await this.router.chat({
        messages: [
          { role: 'system', content: scenario.systemPrompt },
          { role: 'user', content: scenario.userPrompt },
        ],
        maxTokens: 500,
        provider: provider as any,
      });

      const latencyMs = Date.now() - start;
      const decision = this.parseDecision(response.content);
      const isValid = this.validateDecision(decision, scenario);

      if (!isValid) {
        errors.push('Decision does not match expected');
      }

      return {
        provider: response.provider,
        model: response.model,
        latencyMs,
        inputTokens: response.usage?.inputTokens || 0,
        outputTokens: response.usage?.outputTokens || 0,
        estimatedCost: this.estimateCost(response.provider, response.usage),
        decision,
        isValid,
        errors,
      };
    } catch (e) {
      return {
        provider,
        model: 'unknown',
        latencyMs: Date.now() - start,
        inputTokens: 0,
        outputTokens: 0,
        estimatedCost: 0,
        decision: null,
        isValid: false,
        errors: [(e as Error).message],
      };
    }
  }

  /**
   * 解析 LLM 决策
   */
  private parseDecision(content: string): any {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * verify decision
   */
  private validateDecision(decision: any, scenario: BenchmarkScenario): boolean {
    if (!decision) return false;
    if (!decision.action) return false;
    if (scenario.expectedAction && decision.action !== scenario.expectedAction) return false;
    if (scenario.expectedSymbol && decision.symbol !== scenario.expectedSymbol) return false;
    return true;
  }

  /**
   * 估算成本
   */
  private estimateCost(provider: string, usage?: { inputTokens: number; outputTokens: number }): number {
    if (!usage) return 0;

    // 价格 per 1M tokens(input/output)
    const prices: Record<string, [number, number]> = {
      anthropic: [3, 15],   // Sonnet 4.5
      openai: [2.5, 10],     // GPT-4o
      deepseek: [0.14, 0.28],
      qwen: [0.40, 1.20],
      mock: [0, 0],
    };

    const [inputPrice, outputPrice] = prices[provider] || [0, 0];
    const cost = (usage.inputTokens / 1_000_000) * inputPrice +
                 (usage.outputTokens / 1_000_000) * outputPrice;

    return cost;
  }

  private emptyResult(): BenchmarkResult {
    return {
      provider: 'none',
      model: 'none',
      latencyMs: 0,
      inputTokens: 0,
      outputTokens: 0,
      estimatedCost: 0,
      decision: null,
      isValid: false,
      errors: ['No providers available'],
    };
  }

  /**
   * 默认测试场景
   */
  private defaultScenarios(): BenchmarkScenario[] {
    return [
      {
        name: 'BTC 突破 MA20',
        description: 'BTC 突破 MA20,应该 buy',
        systemPrompt: '你是 quant trader,基于市场数据给 buy/sell/hold 决策,JSON 输出',
        userPrompt: 'BTC/USDT 价格 67432,MA20 66800,RSI 62。',
        expectedAction: 'buy',
        expectedSymbol: 'BTC/USDT',
      },
      {
        name: 'ETH 超买',
        description: 'ETH RSI 78 超买,应该 sell',
        systemPrompt: '你是 quant trader,JSON 输出',
        userPrompt: 'ETH/USDT 价格 3500,RSI 78,趋势向上。',
        expectedAction: 'sell',
        expectedSymbol: 'ETH/USDT',
      },
      {
        name: 'SOL 横盘',
        description: 'SOL 横盘无信号,应该 hold',
        systemPrompt: '你是 quant trader,JSON 输出',
        userPrompt: 'SOL/USDT 价格 168,横盘,无明显信号。',
        expectedAction: 'hold',
        expectedSymbol: 'SOL/USDT',
      },
    ];
  }
}
