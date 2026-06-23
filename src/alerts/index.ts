/**
 * 告警通道 - 钉钉/微信/Telegram
 *
 * 用户配置 webhook URL 即生效
 */

import { logger } from '../utils/logger';

export interface AlertConfig {
  dingtalk?: string;
  wechat?: string;
  telegram?: string;
  webhook?: string;  // 通用 webhook
}

export interface Alert {
  level: 'info' | 'warning' | 'error' | 'critical';
  msg: string;
  data?: any;
}

export class AlertManager {
  constructor(private config: AlertConfig) {}

  async send(alert: Alert): Promise<{ sent: boolean; channels: string[] }> {
    const channels: string[] = [];
    let allOk = true;

    // 钉钉
    if (this.config.dingtalk) {
      try {
        await this.sendDingTalk(alert);
        channels.push('dingtalk');
      } catch (e) {
        logger.error('DingTalk alert failed:', e);
        allOk = false;
      }
    }

    // 微信
    if (this.config.wechat) {
      try {
        await this.sendWeChat(alert);
        channels.push('wechat');
      } catch (e) {
        logger.error('WeChat alert failed:', e);
        allOk = false;
      }
    }

    // Telegram
    if (this.config.telegram) {
      try {
        await this.sendTelegram(alert);
        channels.push('telegram');
      } catch (e) {
        logger.error('Telegram alert failed:', e);
        allOk = false;
      }
    }

    // 通用 webhook
    if (this.config.webhook) {
      try {
        await this.sendWebhook(alert, this.config.webhook);
        channels.push('webhook');
      } catch (e) {
        logger.error('Webhook alert failed:', e);
        allOk = false;
      }
    }

    // 没配任何通道,fallback 到 console
    if (channels.length === 0) {
      console.log(`[ALERT ${alert.level.toUpperCase()}] ${alert.msg}`, alert.data || '');
      channels.push('console');
    }

    return { sent: allOk, channels };
  }

  private async sendDingTalk(alert: Alert): Promise<void> {
    const text = `### myagent 告警\n\n**级别**: ${alert.level}\n**消息**: ${alert.msg}\n**时间**: ${new Date().toISOString()}`;
    const response = await fetch(this.config.dingtalk!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msgtype: 'markdown',
        markdown: { title: 'myagent 告警', text },
      }),
    });
    if (!response.ok) throw new Error(`DingTalk HTTP ${response.status}`);
  }

  private async sendWeChat(alert: Alert): Promise<void> {
    const text = `myagent 告警\n[${alert.level}] ${alert.msg}\n${new Date().toISOString()}`;
    const response = await fetch(this.config.wechat!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ msgtype: 'text', text: { content: text } }),
    });
    if (!response.ok) throw new Error(`WeChat HTTP ${response.status}`);
  }

  private async sendTelegram(alert: Alert): Promise<void> {
    // Telegram Bot API 格式: https://api.telegram.org/bot<TOKEN>/sendMessage
    const url = this.config.telegram!;
    const text = `🔔 *myagent*\n[${alert.level.toUpperCase()}] ${alert.msg}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parse_mode: 'Markdown', text }),
    });
    if (!response.ok) throw new Error(`Telegram HTTP ${response.status}`);
  }

  private async sendWebhook(alert: Alert, url: string): Promise<void> {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert),
    });
    if (!response.ok) throw new Error(`Webhook HTTP ${response.status}`);
  }
}
