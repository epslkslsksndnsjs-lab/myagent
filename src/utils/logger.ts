/**
 * 简单 logger - 借鉴 Claude Code 日志思路
 */

type Level = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private level: Level = (process.env.LOG_LEVEL as Level) || 'info';

  private shouldLog(level: Level): boolean {
    const levels: Level[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  private log(level: Level, ...args: any[]): void {
    if (!this.shouldLog(level)) return;
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    console.log(prefix, ...args);
  }

  debug(...args: any[]): void { this.log('debug', ...args); }
  info(...args: any[]): void { this.log('info', ...args); }
  warn(...args: any[]): void { this.log('warn', ...args); }
  error(...args: any[]): void { this.log('error', ...args); }
}

export const logger = new Logger();
