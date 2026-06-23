import { describe, it, expect } from 'vitest';
import { ConfigLoader, type MyagentConfig } from '../src/config/loader';

describe('ConfigLoader', () => {
  it('should return default config when no file', async () => {
    const config = await ConfigLoader.load('/tmp/nonexistent.json');
    expect(config.mode).toBe('paper');
    expect(config.tickInterval).toBe(300);
    expect(config.risk.maxPositionPct).toBe(0.6);
  });

  it('should apply environment variables', async () => {
    process.env.QUANT_MODE = 'live';
    process.env.TICK_INTERVAL = '60';
    const config = await ConfigLoader.load('/tmp/nonexistent.json');
    expect(config.mode).toBe('live');
    expect(config.tickInterval).toBe(60);
    delete process.env.QUANT_MODE;
    delete process.env.TICK_INTERVAL;
  });
});
