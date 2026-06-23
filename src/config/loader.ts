/**
 * 配置加载 - 支持 JSON / YAML
 *
 * 优先级:
 *   1. 命令行参数
 *   2. 环境变量
 *   3. config.json 文件
 *   4. 默认值
 */

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { logger } from '../utils/logger';

export interface MyagentConfig {
  mode: 'paper' | 'live';
  tickInterval: number;        // 秒
  symbols: string[];
  strategy: {
    name: string;
    params: Record<string, any>;
  };
  risk: {
    maxPositionPct: number;
    maxSingleAssetPct: number;
    maxLeverage: number;
    maxDailyLossPct: number;
    maxDrawdownPct: number;
  };
  llm: {
    provider: 'anthropic' | 'openai' | 'deepseek' | 'qwen' | 'mock';
    model: string;
    temperature: number;
    maxTokens: number;
  };
  alerts: {
    dingtalk?: string;
    wechat?: string;
    telegram?: string;
    webhook?: string;
  };
  exchange: {
    provider: 'okx' | 'binance' | 'mock';
    testnet: boolean;
  };
  data: {
    provider: 'coingecko' | 'binance' | 'yahoo' | 'mock';
  };
}

const DEFAULT_CONFIG: MyagentConfig = {
  mode: 'paper',
  tickInterval: 300,
  symbols: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'],
  strategy: {
    name: 'MA Cross',
    params: { fast: 5, slow: 20 },
  },
  risk: {
    maxPositionPct: 0.6,
    maxSingleAssetPct: 0.2,
    maxLeverage: 1.5,
    maxDailyLossPct: 0.05,
    maxDrawdownPct: 0.15,
  },
  llm: {
    provider: 'mock',
    model: 'claude-sonnet-4.5',
    temperature: 0.3,
    maxTokens: 1024,
  },
  alerts: {},
  exchange: {
    provider: 'mock',
    testnet: true,
  },
  data: {
    provider: 'coingecko',
  },
};

export class ConfigLoader {
  /**
   * 加载配置(优先级:env > file > default)
   */
  static async load(configPath?: string): Promise<MyagentConfig> {
    let config = { ...DEFAULT_CONFIG };

    // 1. 读取数据
    const path = configPath || process.env.MYAGENT_CONFIG || './config.json';
    if (existsSync(path)) {
      try {
        const data = await readFile(path, 'utf-8');
        const fileConfig = JSON.parse(data);
        config = this.merge(config, fileConfig);
        logger.info(`Config loaded from ${path}`);
      } catch (e) {
        logger.error(`Failed to load config from ${path}:`, e);
      }
    }

    // 2. 环境变量覆盖
    config = this.applyEnv(config);

    return config;
  }

  /**
   * 合并配置
   */
  private static merge(base: MyagentConfig, override: Partial<MyagentConfig>): MyagentConfig {
    return {
      ...base,
      ...override,
      strategy: { ...base.strategy, ...override.strategy },
      risk: { ...base.risk, ...override.risk },
      llm: { ...base.llm, ...override.llm },
      alerts: { ...base.alerts, ...override.alerts },
      exchange: { ...base.exchange, ...override.exchange },
      data: { ...base.data, ...override.data },
    };
  }

  /**
   * 环境变量
   */
  private static applyEnv(config: MyagentConfig): MyagentConfig {
    if (process.env.QUANT_MODE === 'live' || process.env.QUANT_MODE === 'paper') {
      config.mode = process.env.QUANT_MODE;
    }
    if (process.env.TICK_INTERVAL) {
      config.tickInterval = parseInt(process.env.TICK_INTERVAL);
    }
    if (process.env.LLM_PROVIDER) {
      config.llm.provider = process.env.LLM_PROVIDER as any;
    }
    return config;
  }

  /**
   * 保存配置
   */
  static async save(config: MyagentConfig, path: string = './config.json'): Promise<void> {
    const { writeFile } = await import('fs/promises');
    await writeFile(path, JSON.stringify(config, null, 2));
    logger.info(`Config saved to ${path}`);
  }
}
