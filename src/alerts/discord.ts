/**
 * Discord Webhook 告警
 * 文档: https://discord.com/developers/docs/resources/webhook
 */

import { logger } from '../utils/logger';
import type { Alert } from './index';

export class DiscordAlerter {
  constructor(private webhookUrl: string) {}

  async send(alert: Alert): Promise<boolean> {
    try {
      // Discord embed 格式
      const color = this.severityToColor(alert.level);
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: `myagent ${alert.level.toUpperCase()}`,
            description: alert.msg,
            color,
            timestamp: new Date().toISOString(),
            footer: { text: 'myagent' },
            fields: alert.data ? Object.entries(alert.data).map(([k, v]) => ({
              name: k,
              value: String(v),
              inline: true,
            })) : [],
          }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Discord HTTP ${response.status}`);
      }

      return true;
    } catch (e) {
      logger.error('Discord alert failed:', e);
      return false;
    }
  }

  private severityToColor(level: string): number {
    const map: Record<string, number> = {
      info: 0x3498db,       // blue
      warning: 0xf39c12,    // yellow
      error: 0xe74c3c,      // red
      critical: 0x8b0000,   // dark red
    };
    return map[level] || 0x95a5a6;
  }
}
