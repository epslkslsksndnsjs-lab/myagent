/**
 * Agent 核心 - 借鉴 Claude Code agent loop 思路
 *
 * 借鉴:
 *   - 用户输入 → LLM 思考 → 调工具 → 输出
 *   - 异步生成器模式
 *   - 状态机
 *
 * 差异:
 *   - tick 触发(不是用户输入)
 *   - quant 业务逻辑
 *   - 多 LLM 路由
 */

import { LLMRouter } from '../llm/router';
import { ToolRegistry } from '../tools/registry';
import { logger } from '../utils/logger';
import { sendAlert } from '../tools/quant/send_alert';

export interface AgentConfig {
  systemPrompt: string;
  llm: LLMRouter;
  tools: ToolRegistry;
}

export interface TickContext {
  tickNumber: number;
  mode: 'paper' | 'live';
}

export class Agent {
  constructor(private config: AgentConfig) {}

  /**
   * 每 tick 调一次
   * 工作流:
   *   1. 拉行情
   *   2. 算指标(可选,本地计算)
   *   3. AI 决策(可选,调 LLM)
   *   4. 风控检查
   *   5. 下单(可选)
   *   6. 记录(可选)
   */
  async tick(ctx: TickContext): Promise<void> {
    logger.info(`Tick ${ctx.tickNumber} starting in ${ctx.mode} mode`);

    // Step 1: 拉行情
    const marketData = await this.config.tools.call('get_market_data', {
      symbols: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'],
    });
    logger.debug('Market data:', marketData);

    // Step 2: 拉历史(算指标用)
    const historicalData = await this.config.tools.call('get_historical_data', {
      symbol: 'BTC/USDT',
      interval: '5m',
      limit: 100,
    });

    // Step 3: AI 决策
    const decision = await this.think({
      marketData,
      historicalData,
      mode: ctx.mode,
    });
    logger.info('AI decision:', decision);

    // Step 4: 风控检查
    if (decision.action !== 'hold') {
      const riskCheck = await this.checkRisk(decision);
      if (!riskCheck.pass) {
        logger.warn(`Risk check failed: ${riskCheck.reason}`);
        await sendAlert({
          level: 'warning',
          msg: `Risk check failed: ${riskCheck.reason}`,
        });
        return;
      }
    }

    // Step 5: 下单
    if (decision.action === 'buy' || decision.action === 'sell') {
      if (ctx.mode === 'live') {
        const order = await this.config.tools.call('place_order', {
          symbol: decision.symbol,
          side: decision.action,
          amount: decision.amount,
          type: 'market',
        });
        logger.info('Order placed:', order);
        await sendAlert({
          level: 'info',
          msg: `${decision.action.toUpperCase()} ${decision.symbol} ${decision.amount} @ ${order.price}`,
        });
      } else {
        logger.info(`[PAPER MODE] Would ${decision.action} ${decision.symbol} ${decision.amount}`);
      }
    }
  }

  /**
   * AI 思考 - 调 LLM 做决策
   */
  private async think(context: any): Promise<Decision> {
    // 1. 检查是否有强信号(规则引擎,不走 LLM,省钱)
    const ruleDecision = this.checkRules(context);
    if (ruleDecision) {
      logger.debug('Rule engine decision:', ruleDecision);
      return ruleDecision;
    }

    // 2. 调 LLM 决策
    const prompt = `
基于以下市场数据,给出交易决策:

市场数据: ${JSON.stringify(context.marketData)}
历史数据: ${JSON.stringify(context.historicalData).slice(0, 500)}
模式: ${context.mode}

决策格式(JSON):
{
  "action": "buy" | "sell" | "hold",
  "symbol": "BTC/USDT",
  "amount": 0.1,
  "reasoning": "简短说明"
}

严格要求:
- 0.5% 风险/单笔
- 总持仓 ≤ 60%
- 单一标的 ≤ 20%
- 杠杆 ≤ 1.5x
`;

    try {
      const response = await this.config.llm.chat({
        messages: [
          { role: 'system', content: this.config.systemPrompt },
          { role: 'user', content: prompt },
        ],
        maxTokens: 500,
      });

      // 解析 LLM 响应
      const decision = this.parseDecision(response.content);
      return decision;
    } catch (error) {
      logger.error('LLM call failed:', error);
      // LLM 失败 → 保守 hold
      return { action: 'hold', symbol: 'BTC/USDT', amount: 0, reasoning: 'LLM failed, default hold' };
    }
  }

  /**
   * 规则引擎(简单信号,不走 LLM)
   */
  private checkRules(context: any): Decision | null {
    // TODO: 实现简单规则
    // 例: BTC 突破 MA20 + RSI < 70 → buy
    return null;
  }

  /**
   * 风控检查
   */
  private async checkRisk(decision: Decision): Promise<{ pass: boolean; reason?: string }> {
    // 简化版: 0.5% 风险/单
    const balance = await this.config.tools.call('get_balance', {});
    const riskAmount = balance.total * 0.005; // 0.5%

    if (decision.amount * (decision.price || 0) > riskAmount * 20) {
      // 简化: 仓位不能超过 10% 单笔
      return { pass: false, reason: 'Position too large' };
    }

    return { pass: true };
  }

  /**
   * 解析 LLM 决策
   */
  private parseDecision(content: string): Decision {
    // 尝试解析 JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          action: parsed.action || 'hold',
          symbol: parsed.symbol || 'BTC/USDT',
          amount: parsed.amount || 0,
          reasoning: parsed.reasoning || '',
        };
      } catch (e) {
        // JSON 解析失败
      }
    }

    // 解析失败 → hold
    return { action: 'hold', symbol: 'BTC/USDT', amount: 0, reasoning: 'Parse failed' };
  }
}

export interface Decision {
  action: 'buy' | 'sell' | 'hold';
  symbol: string;
  amount: number;
  price?: number;
  reasoning: string;
}
