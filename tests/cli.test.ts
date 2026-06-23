import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CLI } from '../src/cli/commands';

describe('CLI', () => {
  let consoleLogSpy: any;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('should show help', () => {
    CLI.help();
    expect(consoleLogSpy).toHaveBeenCalled();
    const output = consoleLogSpy.mock.calls.join('\n');
    expect(output).toContain('myagent');
    expect(output).toContain('start');
    expect(output).toContain('backtest');
  });

  it('should show config', async () => {
    await CLI.config('show');
    expect(consoleLogSpy).toHaveBeenCalled();
  });
});
