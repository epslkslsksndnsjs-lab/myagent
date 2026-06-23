/**
 * Context management - 借鉴 Claude Code snipCompact 思路,简化版
 *
 * Claude Code:snipCompact 5 文件(full compaction algo)
 * 我们:简单滑动窗口(够 v0.1 用)
 */

export interface ContextMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export class Context {
  private messages: ContextMessage[] = [];
  private maxMessages = 100; // 简化:最多 100 条消息

  add(msg: ContextMessage): void {
    this.messages.push(msg);
    if (this.messages.length > this.maxMessages) {
      // 简单策略:删最老的
      this.messages.shift();
    }
  }

  getAll(): ContextMessage[] {
    return [...this.messages];
  }

  clear(): void {
    this.messages = [];
  }

  size(): number {
    return this.messages.length;
  }
}
