/**
 * 状态保存 - 借鉴 Claude Code memdir 思路,简化版
 *
 * Claude Code:memdir 21K 行(完整实现)
 * 我们:JSON 存储(简化版,够用)
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import { logger } from '../utils/logger';

const STATE_PATH = process.env.STATE_PATH || './.myagent/state.json';

export interface State {
  lastTick: number;
  positions: Position[];
  pnl: number;
  config: Record<string, any>;
}

export interface Position {
  symbol: string;
  amount: number;
  entryPrice: number;
  currentPrice: number;
  entryTime: number;
  pnl: number;
}

export async function loadState(): Promise<State> {
  try {
    const data = await readFile(STATE_PATH, 'utf-8');
    const state = JSON.parse(data);
    logger.info(`State loaded from ${STATE_PATH}`);
    return state;
  } catch (e) {
    logger.warn(`State not found, using default: ${STATE_PATH}`);
    return {
      lastTick: 0,
      positions: [],
      pnl: 0,
      config: {},
    };
  }
}

export async function saveState(state: State): Promise<void> {
  try {
    await mkdir(dirname(STATE_PATH), { recursive: true });
    await writeFile(STATE_PATH, JSON.stringify(state, null, 2));
    logger.debug(`State saved to ${STATE_PATH}`);
  } catch (e) {
    logger.error('Failed to save state:', e);
  }
}
