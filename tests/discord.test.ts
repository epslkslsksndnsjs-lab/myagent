import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DiscordAlerter } from '../src/alerts/discord';
import { SlackAlerter } from '../src/alerts/slack';

describe('DiscordAlerter', () => {
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

  it('should send alert to Discord webhook', async () => {
    const alerter = new DiscordAlerter('https://discord.com/api/webhooks/test');
    const result = await alerter.send({
      level: 'info',
      msg: 'Test message',
    });
    expect(result).toBe(true);
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://discord.com/api/webhooks/test',
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('should include data in embed fields', async () => {
    const alerter = new DiscordAlerter('https://discord.com/api/webhooks/test');
    await alerter.send({
      level: 'error',
      msg: 'Error',
      data: { code: 500, endpoint: '/api' },
    });
    const callBody = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(callBody.embeds[0].fields).toBeDefined();
  });
});

describe('SlackAlerter', () => {
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

  it('should send alert to Slack webhook', async () => {
    const alerter = new SlackAlerter('https://hooks.slack.com/test');
    const result = await alerter.send({
      level: 'warning',
      msg: 'Warning',
    });
    expect(result).toBe(true);
  });
});
