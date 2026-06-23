/**
 * send_alert 工具的独立导出 - 供 main.ts 启动/异常时使用
 */

import { send_alert } from './index';

export async function sendAlert(input: { level: 'info' | 'warning' | 'error' | 'critical'; msg: string }) {
  return send_alert.execute(input);
}
