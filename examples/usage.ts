/**
 * myagent 完整使用示例
 *
 * 演示:
 *   1. 初始化所有组件
 *   2. 加载市场数据
 *   3. 运行策略
 *   4. 生成信号
 *   5. (可选) 下单
 */

import { Agent } from '../src/core/agent';
import { LLMRouter } from '../src/llm/router';
import { ToolRegistry } from '../src/tools/registry';
import { quantTools } from '../src/tools/quant';
import { getSystemPrompt } from '../src/llm/prompts';
import { CoinGeckoClient } from '../src/data/coingecko';
import { OKXClient } from '../src/exchanges/okx';
import { MACrossStrategy, RSIStrategy, MACDTrendStrategy, BollingerStrategy, type Candle } from '../src/strategies';

async function main() {
  console.log('=== myagent 完整示例 ===\n');

  // 1. 初始化数据源
  const cg = new CoinGeckoClient();
  console.log('1. CoinGecko 客户端就绪');

  // 2. 拉取市场数据
  console.log('2. 拉取 BTC/ETH/SOL 行情...');
  const prices = await cg.getPrices(['BTC', 'ETH', 'SOL']);
  console.log('   ', prices);

  // 3. 初始化 OKX 客户端(可选,需 API key)
  if (process.env.OKX_API_KEY) {
    const okx = new OKXClient({
      apiKey: process.env.OKX_API_KEY!,
      secret: process.env.OKX_SECRET!,
      passphrase: process.env.OKX_PASSPHRASE!,
    });
    console.log('3. OKX 客户端就绪');
  }

  // 4. 初始化 LLM
  const llm = new LLMRouter({
    anthropic: process.env.ANTHROPIC_API_KEY,
    deepseek: process.env.DEEPSEEK_API_KEY,
  });
  console.log('4. LLM Router:', llm.getAvailableProviders().join(', '));

  // 5. 初始化工具
  const tools = new ToolRegistry();
  for (const tool of quantTools) {
    tools.register(tool);
  }
  console.log('5. 工具:', tools.list().join(', '));

  // 6. 初始化 Agent
  const agent = new Agent({
    systemPrompt: getSystemPrompt('paper'),
    llm,
    tools,
  });
  console.log('6. Agent 就绪');

  // 7. 跑 1 个 tick
  console.log('\n7. 跑 1 个 tick...');
  await agent.tick({
    tickNumber: 1,
    mode: 'paper',
  });

  // 8. 演示策略
  console.log('\n8. 演示策略...');
  const mockCandles: Candle[] = Array.from({ length: 30 }, (_, i) => ({
    timestamp: i,
    open: 100 + i,
    high: 110 + i,
    low: 95 + i,
    close: 105 + i,
    volume: 1000,
  }));
  const ctx = {
    symbol: 'BTC/USDT',
    candles: mockCandles,
    position: 0,
    cash: 10000,
  };
  
  const strategies = [
    new MACrossStrategy({ fast: 5, slow: 20 }),
    new RSIStrategy({ period: 14, oversold: 30, overbought: 70 }),
    new MACDTrendStrategy(),
    new BollingerStrategy({ period: 20, stdDev: 2 }),
  ];
  
  for (const strategy of strategies) {
    const signal = strategy.onTick(ctx);
    console.log(`   ${strategy.name}: ${signal}`);
  }

  console.log('\n✅ 完整示例跑通');
}

main().catch(console.error);
