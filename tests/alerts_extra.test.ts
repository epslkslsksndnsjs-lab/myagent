import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AlertManager } from '../src/alerts';

describe('AlertManager', () => {
  let fetchSpy: any;

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
    } as any);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('should send to console when no channels configured', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const manager = new AlertManager({});
    const result = await manager.send({
      level: 'info',
      msg: 'Test',
    });
    expect(result.channels).toContain('console');
    consoleSpy.mockRestore();
  });

  it('should handle multiple channels', async () => {
    const manager = new AlertManager({
      webhook: 'https://example.com/webhook',
      dingtalk: 'https://oapi.dingtalk.com/robot/send?access_token=xxx',
    });
    const result = await manager.send({
      level: 'warning',
      msg: 'Multi channel test',
    });
    expect(result.sent).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('should not crash if all channels fail', async () => {
    fetchSpy.mockResolvedValue({ ok: false, status: 500 } as any);
    const manager = new AlertManager({
      webhook: 'https://example.com/webhook',
    });
    const result = await manager.send({
      level: 'error',
      msg: 'Test',
    });
    expect(result.sent).toBe(false);
  });
});
