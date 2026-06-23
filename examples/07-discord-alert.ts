/**
 * 示例 7: Discord 告警演示
 */

import { AlertManager } from '../src/alerts';

async function main() {
  console.log('=== Discord Alert Demo ===\n');

  // 不配置 URL,只 console 输出
  const manager = new AlertManager({});

  console.log('发送测试告警...');
  const result = await manager.send({
    level: 'warning',
    msg: 'BTC 突破 MA20,可能加仓机会',
    data: {
      symbol: 'BTC/USDT',
      price: 67432,
      ma20: 66800,
      rsi: 62,
    },
  });

  console.log(`\n结果: ${result.sent ? '✅ 成功' : '❌ 失败'}`);
  console.log(`通道: ${result.channels.join(', ')}`);
}

main().catch(console.error);
