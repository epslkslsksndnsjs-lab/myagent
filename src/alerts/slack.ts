/**
 * Slack Webhook 告警
 * 文档: https://api.slack.com/messaging/webhooks
 */

import { logger } from '../utils/logger';
import type { Alert } from './index';

export class SlackAlerter {
  constructor(private webhookUrl: string) {}

  async send(alert: Alert): Promise<boolean> {
    try {
      // Slack Block Kit 格式
      const emoji = this.severityToEmoji(alert.level);
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: `${emoji} myagent ${alert.level.toUpperCase()}`,
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: alert.msg,
              },
            },
            alert.data ? {
              type: 'section',
              fields: Object.entries(alert.data).map(([k, v]) => ({
                type: 'mrkdwn',
                text: `*${k}*: ${v}`,
              })),
            } : null,
            {
              type: 'context',
              elements: [{
                type: 'mrkdwn',
                text: new Date().toISOString(),
              }],
            },
          ].filter(Boolean),
        }),
      });

      if (!response.ok) {
        throw new Error(`Slack HTTP ${response.status}`);
      }

      return true;
    } catch (e) {
      logger.error('Slack alert failed:', e);
      return false;
    }
  }

  private severityToEmoji(level: string): string {
    const map: Record<string, string> = {
      info: ':information_source:',
      warning: ':warning:',
      error: ':x:',
      critical: ':rotating_light:',
    };
    return map[level] || ':robot:';
  }
}
