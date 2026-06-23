/**
 * myagent - AI quant trading agent 入口
 *
 * CLI 模式:
 *   bun run src/main.ts start      (启动 daemon)
 *   bun run src/main.ts status     (看 system)
 *   bun run src/main.ts backtest   (回测)
 *   bun run src/main.ts paper      (paper trading)
 *   bun run src/main.ts config     (配置)
 *   bun run src/main.ts help       (帮助)
 */

import { CLI } from './cli/commands';

const command = process.argv[2] || 'help';
const arg1 = process.argv[3];

async function main() {
  switch (command) {
    case 'start':
      await CLI.start();
      break;
    case 'status':
      await CLI.status();
      break;
    case 'backtest':
      await CLI.backtest(arg1);
      break;
    case 'paper':
      await CLI.paper();
      break;
    case 'config':
      await CLI.config(arg1 as any);
      break;
    case 'help':
    default:
      CLI.help();
      break;
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
