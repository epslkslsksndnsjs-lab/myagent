/**
 * 告警通道 - 多通道支持
 *
 * - 钉钉 (DingTalk)
 * - 微信 (WeChat Work)
 * - Telegram
 * - Discord
 * - Slack
 * - 通用 Webhook
 */

import { logger } from '../utils/logger';
import { DiscordAlerter } from './discord';
import { SlackAlerter } from './slack';

export interface AlertConfig {
  dingtalk?: string;
  wechat?: string;
  telegram?: string;
  discord?: string;
  slack?: string;
  webhook?: string;
}

export interface Alert {
  level: 'info' | 'warning' | 'error' | 'critical';
  msg: string;
  data?: Record<string, any>;
}

export class AlertManager {
  private discord?: DiscordAlerter;
  private slack?: SlackAlerter;

  constructor(private config: AlertConfig) {
    if (config.discord) this.discord = new DiscordAlerter(config.discord);
    if (config.slack) this.slack = new SlackAlerter(config.slack);
  }

  async send(alert: Alert): Promise<{ sent: boolean; channels: string[] }> {
    const channels: string[] = [];
    const promises: Promise<boolean>[] = [];

    // 钉钉
    if (this.config.dingtalk) {
      promises.push(this.sendDingTalk(alert).then(ok => {
        if (ok) channels.push('dingtalk');
        return ok;
      }));
    }

    // 微信
    if (this.config.wechat) {
      promises.push(this.sendWeChat(alert).then(ok => {
        if (ok) channels.push('wechat');
        return ok;
      }));
    }

    // Telegram
    if (this.config.telegram) {
      promises.push(this.sendTelegram(alert).then(ok => {
        if (ok) channels.push('telegram');
        return ok;
      }));
    }

    // Discord
    if (this.discord) {
      promises.push(this.discord.send(alert).then(ok => {
        if (ok) channels.push('discord');
        return ok;
      }));
    }

    // Slack
    if (this.slack) {
      promises.push(this.slack.send(alert).then(ok => {
        if (ok) channels.push('slack');
        return ok;
      }));
    }

    // 通用 webhook
    if (this.config.webhook) {
      promises.push(this.sendWebhook(alert, this.config.webhook).then(ok => {
        if (ok) channels.push('webhook');
        return ok;
      }));
    }

    await Promise.allSettled(promises);

    if (channels.length === 0) {
      console.log(`[ALERT ${alert.level.toUpperCase()}] ${alert.msg}`, alert.data || '');
      channels.push('console');
    }

    return { sent: channels.length > 0, channels };
  }

  private async sendDingTalk(alert: Alert): Promise<boolean> {
    try {
      const text = `### myagent 告警\n\n**级别**: ${alert.level}\n**消息**: ${alert.msg}`;
      const response = await fetch(this.config.dingtalk!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ msgtype: 'markdown', markdown: { title: 'myagent 告警', text } }),
      });
      return response.ok;
    } catch (e) {
      logger.error('DingTalk failed:', e);
      return false;
    }
  }

  private async sendWeChat(alert: Alert): Promise<boolean> {
    try {
      const text = `myagent 告警\n[${alert.level}] ${alert.msg}`;
      const response = await fetch(this.config.wechat!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ msgtype: 'text', text: { content: text } }),
      });
      return response.ok;
    } catch (e) {
      logger.error('WeChat failed:', e);
      return false;
    }
  }

  private async sendTelegram(alert: Alert): Promise<boolean> {
    try {
      const url = this.config.telegram!;
      const text = `🔔 *myagent*\n[${alert.level.toUpperCase()}] ${alert.msg}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parse_mode: 'Markdown', text }),
      });
      return response.ok;
    } catch (e) {
      logger.error('Telegram failed:', e);
      return false;
    }
  }

  private async sendWebhook(alert: Alert, url: string): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert),
      });
      return response.ok;
    } catch (e) {
      logger.error('Webhook failed:', e);
      return false;
    }
  }
}
